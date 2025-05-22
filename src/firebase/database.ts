import { ref, set, get, update, remove, push, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './config';

// Basic CRUD operations for Realtime Database

/**
 * Write data to a specific path in the database
 * @param path - The database path
 * @param data - The data to write
 */
export const writeData = (path: string, data: any) => {
  return set(ref(database, path), data);
};

/**
 * Generate a new unique key and write data
 * @param path - The database path
 * @param data - The data to write
 * @returns The generated key
 */
export const pushData = async (path: string, data: any) => {
  const newRef = push(ref(database, path));
  await set(newRef, data);
  return newRef.key;
};

/**
 * Read data from a specific path
 * @param path - The database path
 */
export const readData = async (path: string) => {
  const snapshot = await get(ref(database, path));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
};

/**
 * Update specific fields at a path
 * @param path - The database path
 * @param updates - Object containing the fields to update
 */
export const updateData = (path: string, updates: any) => {
  return update(ref(database, path), updates);
};

/**
 * Delete data at a specific path
 * @param path - The database path
 */
export const deleteData = (path: string) => {
  return remove(ref(database, path));
};

/**
 * Subscribe to data changes at a specific path
 * @param path - The database path
 * @param callback - Function to call when data changes
 * @returns Unsubscribe function
 */
export const subscribeToData = (path: string, callback: (data: any) => void) => {
  const dataRef = ref(database, path);
  const unsubscribe = onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
  
  return unsubscribe;
};

/**
 * Query data by a specific child value
 * @param path - The database path
 * @param child - The child key to query
 * @param value - The value to match
 */
export const queryByChild = async (path: string, child: string, value: string | number | boolean) => {
  const dataRef = ref(database, path);
  const dataQuery = query(dataRef, orderByChild(child), equalTo(value));
  const snapshot = await get(dataQuery);
  
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
};

// Example usage functions

/**
 * Example: Add a new user
 */
export const addUser = async (userId: string, userData: any) => {
  return writeData(`users/${userId}`, userData);
};

/**
 * Example: Add a new message with auto-generated ID
 */
export const addMessage = async (messageData: any) => {
  return pushData('messages', messageData);
};

/**
 * Example: Get user profile
 */
export const getUserProfile = async (userId: string) => {
  return readData(`users/${userId}`);
};

/**
 * Example: Update user status
 */
export const updateUserStatus = async (userId: string, status: string) => {
  return updateData(`users/${userId}`, { status });
};

/**
 * Example: Delete a message
 */
export const deleteMessage = async (messageId: string) => {
  return deleteData(`messages/${messageId}`);
};

/**
 * Example: Subscribe to user status changes
 */
export const subscribeToUserStatus = (userId: string, callback: (status: string) => void) => {
  return subscribeToData(`users/${userId}/status`, callback);
};
