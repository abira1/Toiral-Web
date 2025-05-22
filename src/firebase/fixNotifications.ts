import { ref, set, get } from 'firebase/database';
import { database } from './config';
import { Notification } from '../contexts/ContentContext';

// Function to fix the notifications path in Firebase
export const fixNotificationsPath = async () => {
  try {
    console.log('Fixing notifications path...');
    
    // First, check if the path exists
    const snapshot = await get(ref(database, 'notifications'));
    
    if (!snapshot.exists()) {
      // If it doesn't exist, create it as an empty object
      console.log('Notifications path does not exist, creating it as an empty object');
      await set(ref(database, 'notifications'), {});
      return true;
    } else {
      // If it exists, check its type
      const data = snapshot.val();
      console.log('Current notifications data type:', typeof data);
      
      // If it's an array, convert it to an object
      if (Array.isArray(data)) {
        console.log('Converting notifications array to object...');
        const notificationsObject = {};
        
        // Convert array items to object entries
        data.forEach((notification: Notification, index: number) => {
          if (notification && notification.id) {
            notificationsObject[notification.id] = notification;
          } else if (notification) {
            // Generate an ID if missing
            const id = `notification_${index}`;
            notificationsObject[id] = { ...notification, id };
          }
        });
        
        // Save the converted object back to Firebase
        await set(ref(database, 'notifications'), notificationsObject);
        console.log('Notifications converted to object format');
        return true;
      } 
      // If it's not an object or is null, reset it to an empty object
      else if (typeof data !== 'object' || data === null) {
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