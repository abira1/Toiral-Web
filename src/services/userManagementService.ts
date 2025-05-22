import {
  ref,
  get,
  query,
  orderByChild,
  limitToLast,
  remove,
  update,
  onValue,
  off
} from 'firebase/database';
import { database } from '../firebase/config';
import { UserLoginData, UserLoginRecord } from '../models/UserLoginData';

/**
 * Fetch all user login data
 */
export const fetchAllUserLoginData = async (): Promise<UserLoginData[]> => {
  try {
    const loginDataRef = ref(database, 'loginData');
    const snapshot = await get(loginDataRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as UserLoginData[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching user login data:', error);
    throw error;
  }
};

/**
 * Subscribe to user login data changes
 */
export const subscribeToUserLoginData = (
  callback: (data: UserLoginData[]) => void
): (() => void) => {
  const loginDataRef = ref(database, 'loginData');

  const handleDataChange = (snapshot: any) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(Object.values(data) as UserLoginData[]);
    } else {
      callback([]);
    }
  };

  onValue(loginDataRef, handleDataChange);

  // Return unsubscribe function
  return () => off(loginDataRef);
};

/**
 * Fetch recent login records
 */
export const fetchRecentLoginRecords = async (limit: number = 50): Promise<UserLoginRecord[]> => {
  try {
    const loginRecordsRef = ref(database, 'loginRecords');
    const recentRecordsQuery = query(
      loginRecordsRef,
      orderByChild('timestamp'),
      limitToLast(limit)
    );

    const snapshot = await get(recentRecordsQuery);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as UserLoginRecord[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching recent login records:', error);
    throw error;
  }
};

/**
 * Subscribe to recent login records
 */
export const subscribeToLoginRecords = (
  callback: (data: UserLoginRecord[]) => void,
  limit: number = 50
): (() => void) => {
  const loginRecordsRef = ref(database, 'loginRecords');
  const recentRecordsQuery = query(
    loginRecordsRef,
    orderByChild('timestamp'),
    limitToLast(limit)
  );

  const handleDataChange = (snapshot: any) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const records = Object.values(data) as UserLoginRecord[];

      // Sort by timestamp (newest first)
      records.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      callback(records);
    } else {
      callback([]);
    }
  };

  onValue(recentRecordsQuery, handleDataChange);

  // Return unsubscribe function
  return () => off(recentRecordsQuery);
};

/**
 * Delete a user's login data
 */
export const deleteUserLoginData = async (uid: string): Promise<void> => {
  try {
    const userLoginDataRef = ref(database, `loginData/${uid}`);
    await remove(userLoginDataRef);
  } catch (error) {
    console.error('Error deleting user login data:', error);
    throw error;
  }
};

/**
 * Update a user's login data
 */
export const updateUserLoginData = async (
  uid: string,
  updates: Partial<UserLoginData>
): Promise<void> => {
  try {
    const userLoginDataRef = ref(database, `loginData/${uid}`);
    await update(userLoginDataRef, updates);
  } catch (error) {
    console.error('Error updating user login data:', error);
    throw error;
  }
};

/**
 * Clear all login records
 */
export const clearAllLoginRecords = async (): Promise<void> => {
  try {
    const loginRecordsRef = ref(database, 'loginRecords');
    await remove(loginRecordsRef);
    console.log('All login records cleared successfully');
  } catch (error) {
    console.error('Error clearing login records:', error);
    throw error;
  }
};
