import { database } from './config';
import { ref, get } from 'firebase/database';

/**
 * Test the Firebase connection by attempting to read from the database
 * @returns A promise that resolves to true if the connection is successful, false otherwise
 */
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from the database root
    const snapshot = await get(ref(database, '/'));
    
    if (snapshot.exists()) {
      console.log('Firebase connection successful!');
      console.log('Database URL:', database.app.options.databaseURL);
      return true;
    } else {
      console.log('Firebase connection successful, but no data found at root.');
      console.log('Database URL:', database.app.options.databaseURL);
      return true;
    }
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

/**
 * Test writing to the Firebase database
 * @returns A promise that resolves to true if the write is successful, false otherwise
 */
export const testFirebaseWrite = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase write operation...');
    
    // Try to write to a test path
    const testRef = ref(database, 'connectionTest');
    
    // Use the Firebase REST API to write data
    const response = await fetch(`${database.app.options.databaseURL}/connectionTest.json`, {
      method: 'PUT',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        message: 'Connection test successful'
      })
    });
    
    if (response.ok) {
      console.log('Firebase write test successful!');
      return true;
    } else {
      console.error('Firebase write test failed:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Firebase write test failed:', error);
    return false;
  }
};
