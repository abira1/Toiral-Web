# Firebase Notifications Setup Guide

This guide explains how to set up Firebase Cloud Messaging (FCM) for sending notifications when appointments are approved.

## Prerequisites

1. Firebase project with Realtime Database and Authentication enabled
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Node.js and npm installed

## Step 1: Set up Firebase Cloud Functions

1. Initialize Firebase Cloud Functions in your project:

```bash
firebase login
firebase init functions
```

2. Copy the Cloud Functions code from `src/api/send-notification.js` to your Firebase Functions project.

3. Install required dependencies:

```bash
cd functions
npm install firebase-admin firebase-functions
```

4. Deploy the functions:

```bash
firebase deploy --only functions
```

## Step 2: Generate VAPID Key for Web Push Notifications

1. Generate a VAPID key pair:

```bash
cd functions
npx web-push generate-vapid-keys
```

2. Add the VAPID public key to your `.env` file:

```
REACT_APP_FIREBASE_VAPID_KEY=your_public_key_here
```

## Step 3: Update Firebase Configuration

1. Make sure your Firebase configuration in `src/firebase/config.ts` includes the correct messagingSenderId and appId.

2. Update the Firebase service worker in `public/firebase-messaging-sw.js` with your Firebase configuration.

## Step 4: Test Notifications

1. Log in to your application and enable notifications when prompted.

2. Create a booking and approve it from the admin panel.

3. You should receive a notification with the title "Your appointment has been successfully approved."

## Troubleshooting

### Notifications not showing up

1. Check browser console for errors.
2. Verify that notification permissions are granted (check browser settings).
3. Ensure the FCM token is correctly stored in the user's profile.
4. Check Firebase Cloud Functions logs for errors.

### Common Issues

- **Missing FCM Token**: Make sure the user has granted notification permissions and the token is stored in their profile.
- **Service Worker Not Registered**: Ensure the Firebase Messaging service worker is correctly registered.
- **CORS Issues**: If using the HTTP API, ensure CORS is properly configured.
- **Missing VAPID Key**: Ensure the VAPID key is correctly set in your environment variables.

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Web Push Notifications Guide](https://firebase.google.com/docs/cloud-messaging/js/client)
