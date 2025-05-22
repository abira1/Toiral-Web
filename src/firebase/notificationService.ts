import { ref, get, set } from 'firebase/database';
import { database } from './config';
import { BookingSubmission } from '../types';

// Campaign ID provided by the user
const CAMPAIGN_ID = '189416541458702904';

// Notification configuration
const NOTIFICATION_CONFIG = {
  title: "Your appointment has been successfully approved.",
  text: "Thank you for your patience! Your appointment has been confirmed and is now approved. We look forward to serving you.",
  imageUrl: "https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png",
  sound: true,
  expirationTimeInDays: 28, // 4 weeks
  platforms: ["android", "ios"],
  customData: {
    appointment: "approved",
    review: "approved"
  }
};

/**
 * Sends a notification to a user when their appointment is approved
 * @param booking The booking that was approved
 * @returns Promise that resolves when the notification is sent
 */
export const sendAppointmentApprovalNotification = async (booking: BookingSubmission): Promise<boolean> => {
  try {
    // In development mode, simulate successful notification
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating notification sending');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    if (!booking.userId) {
      console.error('Cannot send notification: No userId associated with booking');
      return false;
    }

    console.log(`Fetching user profile for userId: ${booking.userId}`);

    // Get user's FCM token from the database
    const userProfileRef = ref(database, `profile/${booking.userId}`);
    const snapshot = await get(userProfileRef);

    if (!snapshot.exists()) {
      console.error('Cannot send notification: User profile not found');
      return false;
    }

    const userProfile = snapshot.val();
    console.log('User profile found:', userProfile);

    // Check if user has FCM token
    if (!userProfile.fcmToken) {
      console.log('User does not have FCM token registered. Notification not sent.');

      // Store a record that we attempted to send a notification
      try {
        const notificationAttemptsRef = ref(database, `notificationAttempts/${booking.userId}/${Date.now()}`);
        await set(notificationAttemptsRef, {
          bookingId: booking.id,
          timestamp: new Date().toISOString(),
          status: 'failed',
          reason: 'no_fcm_token'
        });
      } catch (logError) {
        console.error('Error logging notification attempt:', logError);
      }

      return false;
    }

    // Prepare notification payload
    const payload = {
      campaignId: CAMPAIGN_ID,
      notification: {
        title: NOTIFICATION_CONFIG.title,
        body: NOTIFICATION_CONFIG.text,
        imageUrl: NOTIFICATION_CONFIG.imageUrl,
      },
      data: {
        ...NOTIFICATION_CONFIG.customData,
        bookingId: booking.id,
        appointmentDate: booking.date,
        appointmentTime: booking.time,
        serviceType: booking.serviceType
      },
      android: {
        notification: {
          sound: NOTIFICATION_CONFIG.sound ? 'default' : null,
          imageUrl: NOTIFICATION_CONFIG.imageUrl
        }
      },
      apns: {
        payload: {
          aps: {
            sound: NOTIFICATION_CONFIG.sound ? 'default' : null,
          }
        },
        fcmOptions: {
          imageUrl: NOTIFICATION_CONFIG.imageUrl
        }
      },
      webpush: {
        notification: {
          icon: NOTIFICATION_CONFIG.imageUrl
        }
      },
      token: userProfile.fcmToken,
      // Set expiration time (4 weeks in seconds)
      ttl: NOTIFICATION_CONFIG.expirationTimeInDays * 24 * 60 * 60
    };

    console.log('Sending notification with payload:', JSON.stringify(payload, null, 2));

    // In a real production environment, we would call our backend API
    // For now, we'll simulate a successful notification in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating successful notification');

      // Store a record of the notification
      try {
        const notificationLogRef = ref(database, `notifications/${CAMPAIGN_ID}/${Date.now()}`);
        await set(notificationLogRef, {
          userId: booking.userId,
          bookingId: booking.id,
          timestamp: new Date().toISOString(),
          status: 'sent',
          title: NOTIFICATION_CONFIG.title,
          body: NOTIFICATION_CONFIG.text
        });
      } catch (logError) {
        console.error('Error logging notification:', logError);
      }

      return true;
    }

    // In production, make the actual API call
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send notification: ${response.statusText}. Details: ${errorText}`);
      }

      console.log('Appointment approval notification sent successfully');

      // Store a record of the notification
      const notificationLogRef = ref(database, `notifications/${CAMPAIGN_ID}/${Date.now()}`);
      await set(notificationLogRef, {
        userId: booking.userId,
        bookingId: booking.id,
        timestamp: new Date().toISOString(),
        status: 'sent',
        title: NOTIFICATION_CONFIG.title,
        body: NOTIFICATION_CONFIG.text
      });

      return true;
    } catch (apiError) {
      console.error('API error sending notification:', apiError);

      // Log the failed attempt
      const notificationAttemptsRef = ref(database, `notificationAttempts/${booking.userId}/${Date.now()}`);
      await set(notificationAttemptsRef, {
        bookingId: booking.id,
        timestamp: new Date().toISOString(),
        status: 'failed',
        reason: 'api_error',
        error: apiError.message
      });

      return false;
    }
  } catch (error) {
    console.error('Error sending appointment approval notification:', error);
    return false;
  }
};

/**
 * Registers a device for push notifications
 * @param userId The user ID to associate with the FCM token
 * @param fcmToken The FCM token for the device
 * @returns Promise that resolves when the token is registered
 */
export const registerDeviceForNotifications = async (userId: string, fcmToken: string): Promise<boolean> => {
  try {
    // Update user profile with FCM token
    const userProfileRef = ref(database, `profile/${userId}`);
    const snapshot = await get(userProfileRef);

    if (!snapshot.exists()) {
      console.error('Cannot register device: User profile not found');
      return false;
    }

    const userProfile = snapshot.val();

    // Update user profile with FCM token
    await set(ref(database, `profile/${userId}`), {
      ...userProfile,
      fcmToken
    });

    console.log('Device registered for notifications successfully');
    return true;
  } catch (error) {
    console.error('Error registering device for notifications:', error);
    return false;
  }
};
