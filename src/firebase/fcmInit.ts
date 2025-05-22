import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
// Import from notificationService
import { registerDeviceForNotifications } from './notificationService';
import { getAuth } from 'firebase/auth';
import { app } from './config';

// Initialize Firebase Messaging if supported
let messaging: any = null;

// Check if messaging is supported before initializing
const initMessaging = async () => {
  try {
    if (await isSupported()) {
      messaging = getMessaging(app);
      console.log('Firebase Messaging is supported and initialized');
      return true;
    } else {
      console.log('Firebase Messaging is not supported in this environment');
      return false;
    }
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
    return false;
  }
};

// Function to request permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  console.log('Requesting notification permission...');

  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    console.log('Notification permission granted');

    // Initialize messaging if not already initialized
    const isMessagingSupported = await initMessaging();
    if (!isMessagingSupported || !messaging) {
      console.log('Firebase Messaging is not supported');
      return null;
    }

    try {
      // Get FCM token using VAPID key from environment variables
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.VITE_FIREBASE_VAPID_KEY
      });

      if (currentToken) {
        console.log('FCM token obtained:', currentToken);

        // Register the token with the user's profile
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          await registerDeviceForNotifications(user.uid, currentToken);
          console.log('Device registered for notifications');
        } else {
          console.log('User not logged in, token not registered');
        }

        return currentToken;
      } else {
        console.log('No FCM token available');
        return null;
      }
    } catch (tokenError) {
      console.error('Error getting FCM token:', tokenError);
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.log('Firebase Messaging not initialized, cannot listen for messages');
    return () => {}; // Return empty unsubscribe function
  }

  try {
    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Function to display a notification
export const displayNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const options = {
      body,
      icon: icon || '/favicon.ico'
    };

    new Notification(title, options);
  }
};
