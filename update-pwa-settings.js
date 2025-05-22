// This script updates the PWA settings in Firebase to remove the blue line at the top of mobile UI

// Import Firebase modules
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZDlwmPMVR2n7LIj_9syKhKKCepIEWw_Q",
  authDomain: "toiral-development.firebaseapp.com",
  databaseURL: "https://toiral-development-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "toiral-development",
  storageBucket: "toiral-development.firebasestorage.app",
  messagingSenderId: "408992435427",
  appId: "1:408992435427:web:0e06bd843d788c80ca89d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Update PWA settings
async function updatePWASettings() {
  try {
    // Update the themeColor to match the background color (gray)
    await update(ref(database, 'pwaSettings'), {
      themeColor: '#c0c0c0',
      backgroundColor: '#c0c0c0'
    });

    console.log('PWA settings updated successfully!');
  } catch (error) {
    console.error('Error updating PWA settings:', error);
  }
}

// Run the update function
updatePWASettings();
