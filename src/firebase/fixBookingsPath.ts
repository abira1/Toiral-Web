import { ref, set, get } from 'firebase/database';
import { database } from './config';

/**
 * Function to fix the bookings path in Firebase
 * This will create the path with an empty array if it doesn't exist
 * or reset it to an empty array if it exists but is invalid
 */
export const fixBookingsPath = async (): Promise<boolean> => {
  try {
    console.log('Fixing bookings path...');
    
    // First check if the path exists
    const snapshot = await get(ref(database, 'bookings'));
    
    if (snapshot.exists()) {
      console.log('Bookings path exists, checking if it\'s valid...');
      
      // If it exists but is not an array or is null, reset it
      const value = snapshot.val();
      if (value === null || typeof value !== 'object') {
        console.log('Bookings path exists but is invalid, resetting...');
        await set(ref(database, 'bookings'), []);
        console.log('Bookings path reset to empty array');
      } else {
        console.log('Bookings path is valid');
      }
    } else {
      console.log('Bookings path does not exist, creating...');
      await set(ref(database, 'bookings'), []);
      console.log('Bookings path created with empty array');
    }
    
    // Verify the path was fixed
    const verifySnapshot = await get(ref(database, 'bookings'));
    if (verifySnapshot.exists()) {
      console.log('Bookings path verified');
      return true;
    } else {
      console.error('Failed to verify bookings path exists after fixing');
      return false;
    }
  } catch (error) {
    console.error('Error fixing bookings path:', error);
    return false;
  }
};

/**
 * Function to fix the contactSubmissions path in Firebase
 */
export const fixContactSubmissionsPath = async (): Promise<boolean> => {
  try {
    console.log('Fixing contactSubmissions path...');
    
    // First check if the path exists
    const snapshot = await get(ref(database, 'contactSubmissions'));
    
    if (snapshot.exists()) {
      console.log('ContactSubmissions path exists, checking if it\'s valid...');
      
      // If it exists but is not an array or is null, reset it
      const value = snapshot.val();
      if (value === null || typeof value !== 'object') {
        console.log('ContactSubmissions path exists but is invalid, resetting...');
        await set(ref(database, 'contactSubmissions'), []);
        console.log('ContactSubmissions path reset to empty array');
      } else {
        console.log('ContactSubmissions path is valid');
      }
    } else {
      console.log('ContactSubmissions path does not exist, creating...');
      await set(ref(database, 'contactSubmissions'), []);
      console.log('ContactSubmissions path created with empty array');
    }
    
    // Verify the path was fixed
    const verifySnapshot = await get(ref(database, 'contactSubmissions'));
    if (verifySnapshot.exists()) {
      console.log('ContactSubmissions path verified');
      return true;
    } else {
      console.error('Failed to verify contactSubmissions path exists after fixing');
      return false;
    }
  } catch (error) {
    console.error('Error fixing contactSubmissions path:', error);
    return false;
  }
};
