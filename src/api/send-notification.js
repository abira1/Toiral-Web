// This file would be deployed as a Firebase Cloud Function
// For Firebase Cloud Functions, this would be in functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function to send a notification using Firebase Cloud Messaging
 * This function can be triggered via HTTP request or directly from another Cloud Function
 */
exports.sendNotification = functions.https.onCall(async (data, context) => {
  try {
    // Validate the request
    if (!data.token) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'FCM token is required'
      );
    }

    // Extract data from the request
    const {
      token,
      notification,
      data: messageData,
      android,
      apns,
      webpush,
      ttl,
      campaignId
    } = data;

    // Create the message
    const message = {
      token,
      notification: {
        title: notification.title || 'New Notification',
        body: notification.body || 'You have a new notification',
        imageUrl: notification.imageUrl
      },
      data: messageData || {},
      android: android || {
        notification: {
          sound: 'default',
          imageUrl: notification.imageUrl,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: apns || {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true
          }
        },
        fcmOptions: {
          imageUrl: notification.imageUrl
        }
      },
      webpush: webpush || {
        notification: {
          icon: notification.imageUrl,
          badge: '/badge.png'
        },
        fcmOptions: {
          link: '/'
        }
      }
    };

    // Add TTL if provided
    if (ttl) {
      message.android = {
        ...message.android,
        ttl: ttl * 1000 // Convert to milliseconds
      };
      message.apns = {
        ...message.apns,
        headers: {
          'apns-expiration': Math.floor(Date.now() / 1000) + ttl
        }
      };
    }

    console.log('Sending FCM message:', JSON.stringify(message, null, 2));

    // Send the message
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);

    // Log the notification for analytics
    await admin.database().ref(`notifications/${campaignId || 'default'}/${Date.now()}`).set({
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: messageData,
      status: 'sent',
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    return {
      success: true,
      messageId: response
    };
  } catch (error) {
    console.error('Error sending notification:', error);

    throw new functions.https.HttpsError(
      'internal',
      'Failed to send notification',
      { details: error.message }
    );
  }
});

/**
 * Cloud Function triggered when a booking status is updated to 'approved'
 * This automatically sends a notification to the user
 */
exports.onBookingApproved = functions.database
  .ref('/bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    try {
      const bookingId = context.params.bookingId;
      const beforeData = change.before.val();
      const afterData = change.after.val();

      // Check if the booking status was changed to 'approved'
      if (beforeData.status !== 'approved' && afterData.status === 'approved') {
        console.log(`Booking ${bookingId} was approved. Sending notification...`);

        // Get the user's FCM token
        if (!afterData.userId) {
          console.log('No userId associated with booking. Cannot send notification.');
          return null;
        }

        const userProfileSnapshot = await admin.database()
          .ref(`/profile/${afterData.userId}`)
          .once('value');

        if (!userProfileSnapshot.exists()) {
          console.log('User profile not found. Cannot send notification.');
          return null;
        }

        const userProfile = userProfileSnapshot.val();

        if (!userProfile.fcmToken) {
          console.log('User does not have FCM token registered. Notification not sent.');
          return null;
        }

        // Prepare notification payload
        const payload = {
          token: userProfile.fcmToken,
          notification: {
            title: "Your appointment has been successfully approved.",
            body: "Thank you for your patience! Your appointment has been confirmed and is now approved. We look forward to serving you.",
            imageUrl: "https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png"
          },
          data: {
            appointment: "approved",
            review: "approved",
            bookingId: bookingId,
            appointmentDate: afterData.date,
            appointmentTime: afterData.time,
            serviceType: afterData.serviceType
          },
          android: {
            notification: {
              sound: 'default',
              imageUrl: "https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png"
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default'
              }
            },
            fcmOptions: {
              imageUrl: "https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png"
            }
          },
          webpush: {
            notification: {
              icon: "https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png"
            }
          },
          // Set expiration time (4 weeks in seconds)
          ttl: 28 * 24 * 60 * 60,
          campaignId: '189416541458702904'
        };

        // Send the notification
        const response = await admin.messaging().send(payload);
        console.log('Successfully sent notification:', response);

        // Log the notification
        await admin.database().ref(`notifications/189416541458702904/${Date.now()}`).set({
          bookingId,
          userId: afterData.userId,
          token: userProfile.fcmToken,
          notification: {
            title: payload.notification.title,
            body: payload.notification.body
          },
          data: payload.data,
          status: 'sent',
          timestamp: admin.database.ServerValue.TIMESTAMP
        });

        return { success: true, messageId: response };
      }

      return null;
    } catch (error) {
      console.error('Error sending booking approval notification:', error);
      return { error: error.message };
    }
  });
