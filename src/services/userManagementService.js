import { database } from '../firebase/config';
import { ref, get, set, remove, onValue, off, push, update } from 'firebase/database';

// Fetch all user login data
export const fetchAllUserLoginData = async () => {
  try {
    const usersRef = ref(database, 'userLoginData');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return Object.keys(userData).map(uid => ({
        uid,
        ...userData[uid]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user login data:', error);
    throw error;
  }
};

// Subscribe to user login data changes
export const subscribeToUserLoginData = (callback) => {
  const usersRef = ref(database, 'userLoginData');
  
  const handleData = (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const users = Object.keys(userData).map(uid => ({
        uid,
        ...userData[uid]
      }));
      callback(users);
    } else {
      callback([]);
    }
  };
  
  onValue(usersRef, handleData);
  
  // Return unsubscribe function
  return () => off(usersRef, 'value', handleData);
};

// Fetch recent login records
export const fetchRecentLoginRecords = async (limit = 100) => {
  try {
    const recordsRef = ref(database, 'loginRecords');
    const snapshot = await get(recordsRef);
    
    if (snapshot.exists()) {
      const records = snapshot.val();
      return Object.keys(records)
        .map(key => ({
          id: key,
          ...records[key]
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching login records:', error);
    throw error;
  }
};

// Subscribe to login records changes
export const subscribeToLoginRecords = (callback) => {
  const recordsRef = ref(database, 'loginRecords');
  
  const handleData = (snapshot) => {
    if (snapshot.exists()) {
      const records = snapshot.val();
      const recordsList = Object.keys(records)
        .map(key => ({
          id: key,
          ...records[key]
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      
      callback(recordsList);
    } else {
      callback([]);
    }
  };
  
  onValue(recordsRef, handleData);
  
  // Return unsubscribe function
  return () => off(recordsRef, 'value', handleData);
};

// Delete user login data
export const deleteUserLoginData = async (uid) => {
  try {
    // Delete user login data
    const userRef = ref(database, `userLoginData/${uid}`);
    await remove(userRef);
    
    // Delete user's login records
    const recordsRef = ref(database, 'loginRecords');
    const snapshot = await get(recordsRef);
    
    if (snapshot.exists()) {
      const records = snapshot.val();
      const updates = {};
      
      // Find records for this user and mark them for deletion
      Object.keys(records).forEach(key => {
        if (records[key].uid === uid) {
          updates[key] = null;
        }
      });
      
      // If there are records to delete, update the database
      if (Object.keys(updates).length > 0) {
        await update(recordsRef, updates);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user login data:', error);
    throw error;
  }
};

// Update user login data
export const updateUserLoginData = async (uid, data) => {
  try {
    const userRef = ref(database, `userLoginData/${uid}`);
    await update(userRef, data);
    return true;
  } catch (error) {
    console.error('Error updating user login data:', error);
    throw error;
  }
};

// Clear all login records
export const clearAllLoginRecords = async () => {
  try {
    const recordsRef = ref(database, 'loginRecords');
    await remove(recordsRef);
    return true;
  } catch (error) {
    console.error('Error clearing login records:', error);
    throw error;
  }
};

// Record a new login
export const recordUserLogin = async (uid, userData) => {
  try {
    const timestamp = Date.now();
    
    // Update user login data
    const userRef = ref(database, `userLoginData/${uid}`);
    const userSnapshot = await get(userRef);
    
    if (userSnapshot.exists()) {
      // User exists, update login count and last login
      const currentData = userSnapshot.val();
      await update(userRef, {
        ...userData,
        lastLogin: timestamp,
        loginCount: (currentData.loginCount || 0) + 1
      });
    } else {
      // First login for this user
      await set(userRef, {
        ...userData,
        firstLogin: timestamp,
        lastLogin: timestamp,
        loginCount: 1
      });
    }
    
    // Add login record
    const recordsRef = ref(database, 'loginRecords');
    await push(recordsRef, {
      uid,
      timestamp,
      browser: getBrowserInfo(),
      device: getDeviceInfo()
    });
    
    return true;
  } catch (error) {
    console.error('Error recording user login:', error);
    throw error;
  }
};

// Helper function to get browser info
const getBrowserInfo = () => {
  try {
    const userAgent = navigator.userAgent;
    let browserName = "Unknown";
    
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge";
    } else if (userAgent.match(/msie|trident/i)) {
      browserName = "Internet Explorer";
    }
    
    return browserName;
  } catch (error) {
    return "Unknown";
  }
};

// Helper function to get device info
const getDeviceInfo = () => {
  try {
    const userAgent = navigator.userAgent;
    
    if (/Android/i.test(userAgent)) {
      return "Android";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return "iOS";
    } else if (/Windows/i.test(userAgent)) {
      return "Windows";
    } else if (/Mac/i.test(userAgent)) {
      return "Mac";
    } else if (/Linux/i.test(userAgent)) {
      return "Linux";
    } else {
      return "Unknown";
    }
  } catch (error) {
    return "Unknown";
  }
};
