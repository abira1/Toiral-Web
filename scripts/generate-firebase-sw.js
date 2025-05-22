// This script generates the Firebase messaging service worker with environment variables
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = `.env.${NODE_ENV}`;

console.log(`Generating Firebase service worker using environment from: ${envFile}`);
dotenv.config({ path: envFile });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service worker template
const serviceWorkerTemplate = `// Firebase Cloud Messaging Service Worker
// Generated at: ${new Date().toISOString()}

// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration from environment variables
firebase.initializeApp({
  apiKey: "${process.env.VITE_FIREBASE_API_KEY}",
  authDomain: "${process.env.VITE_FIREBASE_AUTH_DOMAIN}",
  databaseURL: "${process.env.VITE_FIREBASE_DATABASE_URL}",
  projectId: "${process.env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.VITE_FIREBASE_APP_ID}"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click: ', event);

  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow('/');
    })
  );
});
`;

// Output path
const outputPath = path.resolve(__dirname, '../public/firebase-messaging-sw.js');

// Write the file
fs.writeFileSync(outputPath, serviceWorkerTemplate);

console.log(`Firebase service worker generated at: ${outputPath}`);
