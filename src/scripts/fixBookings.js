// This is a standalone script to fix the bookings path
// You can run this directly with Node.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZDlwmPMVR2n7LIj_9syKhKKCepIEWw_Q",
  authDomain: "toiral-development.firebaseapp.com",
  databaseURL: "https://toiral-development-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "toiral-development",
  storageBucket: "toiral-development.firebasestorage.app",
  messagingSenderId: "408992435427",
  appId: "1:408992435427:web:0e06bd843d788c80ca89d6",
  measurementId: "G-YHZT50WVTQ",
  site: "toiral-development"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function fixBookingsPath() {
  console.log('Starting fix for bookings path...');

  try {
    // Step 1: Delete the existing path
    console.log('Deleting existing bookings path...');
    await set(ref(database, 'bookings'), null);
    console.log('Existing bookings path deleted');

    // Wait a moment to ensure deletion is processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Create a new path with an empty array
    console.log('Creating new bookings path with empty array...');
    await set(ref(database, 'bookings'), []);
    console.log('New bookings path created');

    // Wait a moment to ensure creation is processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Verify the path was created
    console.log('Verifying bookings path...');
    const snapshot = await get(ref(database, 'bookings'));

    if (snapshot.exists()) {
      console.log('Bookings path verified successfully!');
      return true;
    } else {
      console.error('Failed to verify bookings path exists after creation');
      return false;
    }
  } catch (error) {
    console.error('Error in fixBookingsPath:', error);
    return false;
  } finally {
    // Exit the process when done
    process.exit(0);
  }
}

// Run the fix
fixBookingsPath();
