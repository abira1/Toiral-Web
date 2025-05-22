import { database } from './config';
import { ref, get, set, update, remove, push, child, onValue, off } from 'firebase/database';
import { Ad, AdStats } from '../types/ad.types';

// Use a consistent path structure with other collections in your project
const ADS_REF = 'ads';

// Initialize the ads collection if it doesn't exist
export const initializeAdsCollection = async (): Promise<void> => {
  try {
    console.log('Checking if ads collection exists...');
    const adsRef = ref(database, ADS_REF);
    const snapshot = await get(adsRef);

    if (!snapshot.exists()) {
      console.log('Ads collection does not exist, initializing...');
      // Create an empty object to initialize the collection
      await set(adsRef, {});
      console.log('Ads collection initialized successfully');

      // Add a sample ad for testing
      await createSampleAd();
    } else {
      console.log('Ads collection already exists');

      // Check if there are any ads
      const ads = await getAds();
      if (ads.length === 0) {
        console.log('No ads found, creating sample ads');
        await createSampleAd();
        await createVideoSampleAd();
      }
    }
  } catch (error) {
    console.error('Error initializing ads collection:', error);
    throw error;
  }
};

// Create a sample ad for testing
export const createSampleAd = async (): Promise<void> => {
  try {
    console.log('Creating sample image ad...');

    const now = Date.now();
    const oneWeekLater = now + 7 * 24 * 60 * 60 * 1000;

    const sampleAd = {
      type: 'banner',
      title: 'Welcome Banner - Sample Ad',
      content: {
        heading: 'Welcome to Toiral!',
        body: 'Check out our latest services and special offers.',
        mediaType: 'image',
        mediaUrl: 'https://via.placeholder.com/300x150?text=Toiral+Ad',
        videoAutoplay: true,
        videoMuted: true,
        videoControls: true,
        buttonText: 'Learn More',
        buttonUrl: '#about'
      },
      styling: {
        backgroundColor: '#c0c0c0',
        textColor: '#000000',
        accentColor: '#000080',
        borderRadius: '0'
      },
      animation: {
        type: 'fade',
        direction: 'bottom',
        duration: 0.5
      },
      display: {
        position: 'bottom',
        startDate: now,
        endDate: oneWeekLater,
        frequency: 'always',
        delay: 1,
        showOnPages: [],
        closeAfter: 0,
        minTimeBetweenDisplays: 30 // 30 seconds minimum between displays
      },
      isActive: true
    };

    await createAd(sampleAd);
    console.log('Sample image ad created successfully');
  } catch (error) {
    console.error('Error creating sample image ad:', error);
    throw error;
  }
};

// Create a video sample ad for testing
export const createVideoSampleAd = async (): Promise<void> => {
  try {
    console.log('Creating sample video ad...');

    const now = Date.now();
    const oneWeekLater = now + 7 * 24 * 60 * 60 * 1000;

    const sampleVideoAd = {
      type: 'popup',
      title: 'Video Demonstration - Sample Ad',
      content: {
        heading: 'Watch Our Video Demo',
        body: 'Check out our video demonstration!',
        mediaType: 'video',
        // Using a royalty-free sample video
        mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        videoAutoplay: true,
        videoMuted: true,
        videoControls: true,
        buttonText: 'Learn More',
        buttonUrl: '#about'
      },
      styling: {
        backgroundColor: '#c0c0c0',
        textColor: '#000000',
        accentColor: '#000080',
        borderRadius: '0',
        width: '400px'
      },
      animation: {
        type: 'fade',
        direction: 'bottom',
        duration: 0.5
      },
      display: {
        position: 'center',
        startDate: now,
        endDate: oneWeekLater,
        frequency: 'always',
        delay: 3,
        showOnPages: [],
        closeAfter: 0,
        minTimeBetweenDisplays: 60 // 60 seconds minimum between displays for video ads
      },
      isActive: true
    };

    await createAd(sampleVideoAd);
    console.log('Sample video ad created successfully');
  } catch (error) {
    console.error('Error creating sample video ad:', error);
    throw error;
  }
};

// Get all ads
export const getAds = async (): Promise<Ad[]> => {
  try {
    const adsRef = ref(database, ADS_REF);
    const snapshot = await get(adsRef);

    if (snapshot.exists()) {
      const adsData = snapshot.val();
      return Object.keys(adsData).map(key => ({
        id: key,
        ...adsData[key]
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};

// Get only active ads
export const getActiveAds = async (): Promise<Ad[]> => {
  try {
    const ads = await getAds();
    const now = Date.now();

    return ads.filter(ad =>
      ad.isActive &&
      ad.display.startDate <= now &&
      ad.display.endDate >= now
    );
  } catch (error) {
    console.error('Error fetching active ads:', error);
    throw error;
  }
};

// Create a new ad
export const createAd = async (adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<string> => {
  try {
    const adsRef = ref(database, ADS_REF);
    const newAdRef = push(adsRef);
    const now = Date.now();

    const newAd: Omit<Ad, 'id'> = {
      ...adData,
      stats: {
        impressions: 0,
        clicks: 0,
        closes: 0
      },
      createdAt: now,
      updatedAt: now
    };

    await set(newAdRef, newAd);
    return newAdRef.key as string;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
};

// Update an existing ad
export const updateAd = async (adId: string, adData: Partial<Ad>): Promise<void> => {
  try {
    const adRef = ref(database, `${ADS_REF}/${adId}`);
    const updates = {
      ...adData,
      updatedAt: Date.now()
    };

    await update(adRef, updates);
  } catch (error) {
    console.error(`Error updating ad ${adId}:`, error);
    throw error;
  }
};

// Delete an ad
export const deleteAd = async (adId: string): Promise<void> => {
  try {
    const adRef = ref(database, `${ADS_REF}/${adId}`);
    await remove(adRef);
  } catch (error) {
    console.error(`Error deleting ad ${adId}:`, error);
    throw error;
  }
};

// Toggle ad active status
export const toggleAdStatus = async (adId: string, isActive: boolean): Promise<void> => {
  try {
    const adRef = ref(database, `${ADS_REF}/${adId}`);
    await update(adRef, {
      isActive,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error(`Error toggling ad status for ${adId}:`, error);
    throw error;
  }
};

// Increment ad statistics (impressions, clicks, closes)
export const incrementAdStat = async (adId: string, statType: keyof AdStats): Promise<void> => {
  try {
    const statRef = ref(database, `${ADS_REF}/${adId}/stats/${statType}`);
    const snapshot = await get(statRef);
    const currentValue = snapshot.exists() ? snapshot.val() : 0;

    await set(statRef, currentValue + 1);
  } catch (error) {
    console.error(`Error incrementing ${statType} for ad ${adId}:`, error);
    throw error;
  }
};

// Subscribe to active ads (real-time updates)
export const subscribeToActiveAds = (callback: (ads: Ad[]) => void): (() => void) => {
  console.log(`AdService: Subscribing to ads at path: ${ADS_REF}`);
  const adsRef = ref(database, ADS_REF);

  const handleValueChange = (snapshot: any) => {
    console.log('AdService: Received snapshot from Firebase');

    if (snapshot.exists()) {
      const adsData = snapshot.val();
      console.log('AdService: Raw ads data:', adsData);

      const now = Date.now();

      try {
        const ads = Object.keys(adsData)
          .map(key => ({
            id: key,
            ...adsData[key]
          }))
          .filter((ad: Ad) => {
            // Add null checks to prevent errors
            if (!ad.isActive) {
              console.log(`AdService: Ad ${ad.id} is not active`);
              return false;
            }

            if (!ad.display || typeof ad.display.startDate !== 'number' || typeof ad.display.endDate !== 'number') {
              console.log(`AdService: Ad ${ad.id} has invalid date range:`, ad.display);
              return false;
            }

            const isInDateRange = ad.display.startDate <= now && ad.display.endDate >= now;
            if (!isInDateRange) {
              console.log(`AdService: Ad ${ad.id} is outside date range: ${new Date(ad.display.startDate).toLocaleString()} - ${new Date(ad.display.endDate).toLocaleString()}`);
              return false;
            }

            return true;
          });

        console.log('AdService: Filtered active ads:', ads);
        callback(ads);
      } catch (error) {
        console.error('AdService: Error processing ads data:', error);
        callback([]);
      }
    } else {
      console.log('AdService: No ads found in database');
      callback([]);
    }
  };

  onValue(adsRef, handleValueChange, (error) => {
    console.error('AdService: Error subscribing to ads:', error);
    callback([]);
  });

  // Return unsubscribe function
  return () => {
    console.log('AdService: Unsubscribing from ads');
    off(adsRef);
  };
};
