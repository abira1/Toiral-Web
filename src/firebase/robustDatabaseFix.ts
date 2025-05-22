import { ref, set, get, update, push } from 'firebase/database';
import { database } from './config';
import { BookingSubmission, ContactFormSubmission } from '../types';

/**
 * Robust fix for database paths
 * This function will fix both the bookings and contactSubmissions paths
 */
export const robustDatabaseFix = async (): Promise<boolean> => {
  console.log('Starting robust database fix...');
  
  try {
    // Fix bookings path
    await fixBookingsPath();
    
    // Fix contactSubmissions path
    await fixContactSubmissionsPath();
    
    console.log('Database fix completed successfully!');
    return true;
  } catch (error) {
    console.error('Error in robust database fix:', error);
    return false;
  }
};

/**
 * Fix the bookings path
 */
export const fixBookingsPath = async (): Promise<boolean> => {
  console.log('Fixing bookings path...');
  
  try {
    // First check if the path exists
    const snapshot = await get(ref(database, 'bookings'));
    
    // If it exists but is not an object, delete it and recreate
    if (snapshot.exists()) {
      const value = snapshot.val();
      console.log('Bookings path exists, current value:', value);
      
      // If it's not an object or is null, reset it
      if (value === null || (typeof value !== 'object' && !Array.isArray(value))) {
        console.log('Bookings path exists but is invalid, resetting...');
        await set(ref(database, 'bookings'), null);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (Array.isArray(value) && value.length === 0) {
        console.log('Bookings path is an empty array, which is valid but might cause issues. Converting to object...');
        await set(ref(database, 'bookings'), {});
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Create a sample booking to ensure the path is valid
    const bookingId = 'sample-' + Date.now();
    const sampleBooking: BookingSubmission & { isSample: boolean } = {
      id: bookingId,
      firstName: 'Sample',
      lastName: 'User',
      email: 'sample@example.com',
      phone: '123-456-7890',
      serviceType: 'Sample Service',
      date: '2023-01-01',
      time: '12:00',
      description: 'This is a sample booking to initialize the bookings path.',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      isSample: true
    };
    
    await set(ref(database, `bookings/${bookingId}`), sampleBooking);
    
    console.log('Sample booking created successfully');
    
    // Verify the path was fixed
    const verifySnapshot = await get(ref(database, 'bookings'));
    if (verifySnapshot.exists()) {
      console.log('Bookings path verified successfully!');
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
 * Fix the contactSubmissions path
 */
export const fixContactSubmissionsPath = async (): Promise<boolean> => {
  console.log('Fixing contactSubmissions path...');
  
  try {
    // First check if the path exists
    const snapshot = await get(ref(database, 'contactSubmissions'));
    
    // If it exists but is not an object, delete it and recreate
    if (snapshot.exists()) {
      const value = snapshot.val();
      console.log('ContactSubmissions path exists, current value:', value);
      
      // If it's not an object or is null, reset it
      if (value === null || (typeof value !== 'object' && !Array.isArray(value))) {
        console.log('ContactSubmissions path exists but is invalid, resetting...');
        await set(ref(database, 'contactSubmissions'), null);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (Array.isArray(value) && value.length === 0) {
        console.log('ContactSubmissions path is an empty array, which is valid but might cause issues. Converting to object...');
        await set(ref(database, 'contactSubmissions'), {});
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Create a sample contact submission to ensure the path is valid
    const contactId = 'sample-' + Date.now();
    const sampleSubmission: ContactFormSubmission & { isSample: boolean } = {
      id: contactId,
      name: 'Sample User',
      email: 'sample@example.com',
      subject: 'Sample Subject',
      message: 'This is a sample contact submission to initialize the contactSubmissions path.',
      status: 'new',
      submittedAt: new Date().toISOString(),
      isSample: true
    };
    
    await set(ref(database, `contactSubmissions/${contactId}`), sampleSubmission);
    
    console.log('Sample contact submission created successfully');
    
    // Verify the path was fixed
    const verifySnapshot = await get(ref(database, 'contactSubmissions'));
    if (verifySnapshot.exists()) {
      console.log('ContactSubmissions path verified successfully!');
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

// Make the function available globally for direct console access
declare global {
  interface Window {
    robustDatabaseFix: () => Promise<boolean>;
    fixBookingsPath: () => Promise<boolean>;
    fixContactSubmissionsPath: () => Promise<boolean>;
  }
}

if (typeof window !== 'undefined') {
  window.robustDatabaseFix = robustDatabaseFix;
  window.fixBookingsPath = fixBookingsPath;
  window.fixContactSubmissionsPath = fixContactSubmissionsPath;
  console.log('Database fix functions are now available in the console:');
  console.log('- window.robustDatabaseFix() - Fix both bookings and contactSubmissions paths');
  console.log('- window.fixBookingsPath() - Fix only the bookings path');
  console.log('- window.fixContactSubmissionsPath() - Fix only the contactSubmissions path');
}
