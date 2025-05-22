import { database } from './config';
import { ref, get } from 'firebase/database';

// This function checks if we can read from the ads path
// It will help diagnose permission issues
export const checkAdsPermission = async (): Promise<boolean> => {
  try {
    console.log('Checking ads permission...');
    const adsRef = ref(database, 'ads');
    const snapshot = await get(adsRef);
    
    console.log('Ads permission check result:', snapshot.exists() ? 'Access granted' : 'No data but access granted');
    return true;
  } catch (error) {
    console.error('Ads permission check failed:', error);
    return false;
  }
};
