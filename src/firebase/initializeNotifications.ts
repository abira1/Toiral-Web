import { ref, set, get } from 'firebase/database';
import { database } from './config';

// Function to initialize the notifications path if it doesn't exist
export const initializeNotificationsPath = async () => {
  try {
    console.log('Checking notifications path...');
    const snapshot = await get(ref(database, 'notifications'));
    
    if (!snapshot.exists()) {
      console.log('Notifications path does not exist, initializing...');
      await set(ref(database, 'notifications'), {});
      console.log('Notifications path initialized successfully with empty object');
      return true;
    } else {
      console.log('Notifications path already exists');
      
      // If it exists but is not an object, reset it to an empty object
      const data = snapshot.val();
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        console.log('Notifications data is not an object, resetting to empty object');
        await set(ref(database, 'notifications'), {});
        console.log('Notifications path reset to empty object');
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error initializing notifications path:', error);
    return false;
  }
};