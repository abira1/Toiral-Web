import { ref, set, get, update } from 'firebase/database';
import { database } from './config';

/**
 * Emergency fix for the bookings path
 * This function tries multiple approaches to fix the bookings path
 */
export const emergencyFixBookings = async () => {
  console.log('Starting EMERGENCY fix for bookings path...');
  
  try {
    // Approach 1: Try to create a simple object with a dummy booking
    try {
      console.log('Approach 1: Creating bookings path with dummy booking object...');
      await set(ref(database, 'bookings'), {
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
      console.log('Approach 1: Created bookings path with dummy booking object.');
    } catch (error) {
      console.error('Approach 1 failed:', error);
    }
    
    // Verify if approach 1 worked
    let snapshot = await get(ref(database, 'bookings'));
    if (snapshot.exists()) {
      console.log('Verification of Approach 1: SUCCESS - Bookings path exists!');
      return true;
    }
    
    // Approach 2: Try to create a simple object with a bookings array
    try {
      console.log('Approach 2: Creating bookings path with bookingsList array...');
      await set(ref(database, 'bookings'), {
        bookingsList: []
      });
      console.log('Approach 2: Created bookings path with bookingsList array.');
    } catch (error) {
      console.error('Approach 2 failed:', error);
    }
    
    // Verify if approach 2 worked
    snapshot = await get(ref(database, 'bookings'));
    if (snapshot.exists()) {
      console.log('Verification of Approach 2: SUCCESS - Bookings path exists!');
      return true;
    }
    
    // Approach 3: Try to create a simple string value
    try {
      console.log('Approach 3: Creating bookings path with string value...');
      await set(ref(database, 'bookings'), "initialized");
      console.log('Approach 3: Created bookings path with string value.');
    } catch (error) {
      console.error('Approach 3 failed:', error);
    }
    
    // Verify if approach 3 worked
    snapshot = await get(ref(database, 'bookings'));
    if (snapshot.exists()) {
      console.log('Verification of Approach 3: SUCCESS - Bookings path exists!');
      return true;
    }
    
    // Approach 4: Try to use update instead of set
    try {
      console.log('Approach 4: Using update to create bookings path...');
      await update(ref(database), {
        'bookings/initialized': true
      });
      console.log('Approach 4: Used update to create bookings path.');
    } catch (error) {
      console.error('Approach 4 failed:', error);
    }
    
    // Final verification
    snapshot = await get(ref(database, 'bookings'));
    if (snapshot.exists()) {
      console.log('Final verification: SUCCESS - Bookings path exists!');
      return true;
    } else {
      console.error('All approaches failed. Bookings path still does not exist.');
      return false;
    }
  } catch (error) {
    console.error('Error in emergency fix for bookings path:', error);
    return false;
  }
};

// Make the function available globally for direct console access
if (typeof window !== 'undefined') {
  window.emergencyFixBookings = emergencyFixBookings;
  console.log('emergencyFixBookings function is now available in the console. Run window.emergencyFixBookings() to fix the bookings path.');
}
