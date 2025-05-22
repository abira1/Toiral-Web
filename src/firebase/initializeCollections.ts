import { ref, set } from 'firebase/database';
import { database } from './config';
import { initializeSocialStats } from './socialDatabase';

// Function to initialize a collection with a basic structure
const initializeCollection = async (collectionPath: string) => {
  try {
    await set(ref(database, collectionPath), {
      status: "initialized"
    });
    console.log(`Collection ${collectionPath} initialized successfully`);
    return true;
  } catch (error) {
    console.error(`Error initializing collection ${collectionPath}:`, error);
    return false;
  }
};

// Function to initialize all required collections
export const initializeAllCollections = async () => {
  const collections = [
    'toiral',
    'portfolio',
    'reviews',
    'contact',
    'bookings',
    'security',
    'profile',
    'theme',
    'socialStats',
    'community'
  ];

  console.log('Starting initialization of all collections...');

  const results = await Promise.all(
    collections.map(collection => initializeCollection(collection))
  );

  const allSuccessful = results.every(result => result === true);

  if (allSuccessful) {
    console.log('All collections initialized successfully');
    return true;
  } else {
    console.error('Some collections failed to initialize');
    return false;
  }
};

// Export individual initialization functions for specific use cases
export const initializeToiral = () => initializeCollection('toiral');
export const initializePortfolio = () => initializeCollection('portfolio');
export const initializeReviews = () => initializeCollection('reviews');
export const initializeContact = () => initializeCollection('contact');
export const initializeBookings = () => initializeCollection('bookings');
export const initializeSecurity = () => initializeCollection('security');
export const initializeProfile = () => initializeCollection('profile');
export const initializeTheme = () => initializeCollection('theme');
export const initializeSocialStatsCollection = () => initializeCollection('socialStats');
export const initializeCommunity = () => initializeCollection('community');

// Initialize social stats with default values
export const initializeSocialStatsWithDefaults = async () => {
  try {
    await initializeSocialStats();
    return true;
  } catch (error) {
    console.error('Error initializing social stats with defaults:', error);
    return false;
  }
};
