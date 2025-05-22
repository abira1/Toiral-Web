import { database } from './config';
import { ref, get, set, update, remove, onValue, off } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

// Types
interface SocialStats {
  [key: string]: number;
}

// Get social statistics
export const getSocialStats = async (): Promise<SocialStats> => {
  try {
    const snapshot = await get(ref(database, 'socialStats'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.error('Error getting social stats:', error);
    throw error;
  }
};

// Update social statistics
export const updateSocialStats = async (stats: SocialStats): Promise<void> => {
  try {
    await set(ref(database, 'socialStats'), stats);
  } catch (error) {
    console.error('Error updating social stats:', error);
    throw error;
  }
};

// Update a single social platform count
export const updateSocialPlatformCount = async (platform: string, count: number): Promise<void> => {
  try {
    await update(ref(database, 'socialStats'), {
      [platform]: count
    });
  } catch (error) {
    console.error(`Error updating ${platform} count:`, error);
    throw error;
  }
};

// Remove a social platform
export const removeSocialPlatform = async (platform: string): Promise<void> => {
  try {
    await remove(ref(database, `socialStats/${platform}`));
  } catch (error) {
    console.error(`Error removing ${platform}:`, error);
    throw error;
  }
};

// Subscribe to social stats changes
export const subscribeToSocialStats = (
  callback: (stats: SocialStats) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  const socialStatsRef = ref(database, 'socialStats');
  
  const handleData = (snapshot: any) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback({});
    }
  };
  
  const handleError = (error: Error) => {
    console.error('Error in social stats subscription:', error);
    if (errorCallback) {
      errorCallback(error);
    }
  };
  
  onValue(socialStatsRef, handleData, handleError);
  
  // Return unsubscribe function
  return () => off(socialStatsRef);
};

// Initialize social stats with default values
export const initializeSocialStats = async (): Promise<void> => {
  try {
    const snapshot = await get(ref(database, 'socialStats'));
    
    // Only initialize if the collection doesn't exist
    if (!snapshot.exists()) {
      const defaultStats: SocialStats = {
        facebook: 1200,
        twitter: 800,
        instagram: 2500,
        linkedin: 650,
        clients: 50,
        projects: 120
      };
      
      await set(ref(database, 'socialStats'), defaultStats);
      console.log('Social stats initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing social stats:', error);
    throw error;
  }
};
