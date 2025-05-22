import { ref, set, get } from 'firebase/database';
import { database } from './config';

/**
 * Direct fix for the bookings path
 * This function will:
 * 1. Delete the existing bookings path
 * 2. Create a new bookings path with an empty array
 * 3. Verify the path was created successfully
 */
export const directFixBookings = async () => {
  console.log('Starting direct fix for bookings path...');
  
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
    console.error('Error in directFixBookings:', error);
    return false;
  }
};

// Make the function available globally for direct console access
if (typeof window !== 'undefined') {
  window.directFixBookings = directFixBookings;
  console.log('directFixBookings function is now available in the console. Run window.directFixBookings() to fix the bookings path.');
}
