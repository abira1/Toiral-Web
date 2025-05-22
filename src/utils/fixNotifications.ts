import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';

// Function to fix the notifications path in Firebase
export const fixNotificationsPath = async () => {
  try {
    console.log('Fixing notifications path...');
    
    // First, check if the path exists
    const snapshot = await get(ref(database, 'notifications'));
    
    if (!snapshot.exists()) {
      // If it doesn't exist, create it as an empty array
      console.log('Notifications path does not exist, creating it as an empty array');
      await set(ref(database, 'notifications'), {});
      return true;
    } else {
      // If it exists, check its type
      const data = snapshot.val();
      console.log('Current notifications data:', data);
      
      // If it's not an object, reset it to an empty object
      if (typeof data !== 'object' || data === null) {
        console.log('Notifications data is not an object, resetting to empty object');
        await set(ref(database, 'notifications'), {});
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error fixing notifications path:', error);
    return false;
  }
};