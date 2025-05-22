// This script uses the Firebase Admin SDK to fix the bookings path
// You'll need to set up a service account to use this script

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You'll need to create this file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://toiral-development-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Get a database reference
const db = admin.database();

async function adminFixBookings() {
  console.log('Starting admin fix for bookings path...');

  try {
    // First, try to delete the existing path
    console.log('Deleting existing bookings path...');
    await db.ref('bookings').remove();
    console.log('Existing bookings path deleted');

    // Wait a moment to ensure deletion is processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try multiple approaches to create the bookings path

    // Approach 1: Create with empty array
    console.log('Approach 1: Creating bookings path with empty array...');
    await db.ref('bookings').set([]);

    // Verify if approach 1 worked
    let snapshot = await db.ref('bookings').once('value');
    if (snapshot.exists()) {
      console.log('Verification of Approach 1: SUCCESS - Bookings path exists!');
      return true;
    }

    // Approach 2: Create with object
    console.log('Approach 2: Creating bookings path with object...');
    await db.ref('bookings').set({
      initialized: true
    });

    // Verify if approach 2 worked
    snapshot = await db.ref('bookings').once('value');
    if (snapshot.exists()) {
      console.log('Verification of Approach 2: SUCCESS - Bookings path exists!');
      return true;
    }

    // Approach 3: Create with dummy booking
    console.log('Approach 3: Creating bookings path with dummy booking...');
    await db.ref('bookings').set({
      dummyBooking: {
        id: 'dummy',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '123-456-7890',
        serviceType: 'Test',
        date: '2023-01-01',
        time: '12:00',
        description: 'Test booking',
        status: 'pending',
        submittedAt: new Date().toISOString()
      }
    });

    // Final verification
    snapshot = await db.ref('bookings').once('value');
    if (snapshot.exists()) {
      console.log('Final verification: SUCCESS - Bookings path exists!');
      return true;
    } else {
      console.error('All approaches failed. Bookings path still does not exist.');
      return false;
    }
  } catch (error) {
    console.error('Error in admin fix for bookings path:', error);
    return false;
  } finally {
    // Exit the process when done
    process.exit(0);
  }
}

// Run the fix
adminFixBookings();
