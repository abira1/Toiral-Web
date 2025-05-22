/**
 * Encryption utilities for securing sensitive data
 * Uses AES encryption from CryptoJS
 */
import CryptoJS from 'crypto-js';

// Get encryption key from environment variables
// In a real application, this should be stored securely and not in client-side code
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-for-development-only';

/**
 * Encrypts sensitive data
 * @param data The data to encrypt
 * @returns The encrypted data as a string
 */
export const encryptData = (data: string | object): string => {
  try {
    // Convert object to string if necessary
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data;
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts encrypted data
 * @param encryptedData The encrypted data string
 * @returns The decrypted data
 */
export const decryptData = (encryptedData: string): string => {
  try {
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Decrypts data and parses it as JSON
 * @param encryptedData The encrypted data string
 * @returns The decrypted data as an object
 */
export const decryptAndParseJSON = (encryptedData: string): any => {
  try {
    const decrypted = decryptData(encryptedData);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting and parsing JSON:', error);
    throw new Error('Failed to decrypt and parse JSON data');
  }
};

/**
 * Encrypts sensitive user data
 * @param userId The user ID
 * @param dataType The type of data (e.g., 'paymentInfo', 'personalInfo')
 * @param data The data to encrypt
 * @returns Object with success status and error if any
 */
export const encryptAndStoreUserData = async (
  userId: string, 
  dataType: string, 
  data: any
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Import Firebase modules dynamically to avoid circular dependencies
    const { database } = await import('../firebase/config');
    const { ref, set } = await import('firebase/database');
    
    // Encrypt the data
    const encrypted = encryptData(data);
    
    // Store the encrypted data
    await set(ref(database, `sensitiveUserData/${userId}/${dataType}`), {
      encrypted: true,
      data: encrypted,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error(`Error encrypting and storing ${dataType}:`, error);
    return { success: false, error };
  }
};

/**
 * Retrieves and decrypts sensitive user data
 * @param userId The user ID
 * @param dataType The type of data (e.g., 'paymentInfo', 'personalInfo')
 * @returns The decrypted data or null if not found
 */
export const retrieveAndDecryptUserData = async (
  userId: string, 
  dataType: string
): Promise<any> => {
  try {
    // Import Firebase modules dynamically to avoid circular dependencies
    const { database } = await import('../firebase/config');
    const { ref, get } = await import('firebase/database');
    
    // Get the encrypted data
    const snapshot = await get(ref(database, `sensitiveUserData/${userId}/${dataType}`));
    
    if (snapshot.exists()) {
      const encryptedData = snapshot.val();
      
      // Check if the data is encrypted
      if (encryptedData.encrypted && encryptedData.data) {
        // Decrypt the data
        return decryptAndParseJSON(encryptedData.data);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving and decrypting ${dataType}:`, error);
    return null;
  }
};

/**
 * Hashes a string using SHA-256
 * @param data The data to hash
 * @returns The hashed data
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Generates a random encryption key
 * @returns A random encryption key
 */
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

/**
 * Checks if the environment has a valid encryption key
 * @returns True if a valid encryption key is available
 */
export const hasValidEncryptionKey = (): boolean => {
  return ENCRYPTION_KEY !== 'default-key-for-development-only';
};
