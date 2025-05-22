import { ref, set, get } from 'firebase/database';
import { database } from './config';

// Function to initialize a path if it doesn't exist
const initializePath = async (path: string) => {
  try {
    const snapshot = await get(ref(database, path));
    if (!snapshot.exists()) {
      // Use appropriate default values based on the path
      let defaultValue: any = { status: "initialized" };

      // Special cases for array-type paths
      if (path === 'reviews' ||
          path === 'bookings' ||
          path === 'contactSubmissions') {
        defaultValue = [];
      }

      // Special case for contactInfo
      if (path === 'contactInfo') {
        defaultValue = {
          officeHours: {
            days: 'Monday - Friday',
            hours: '9:00 AM - 6:00 PM',
            timezone: 'GMT+6'
          },
          phone: '+880 1804-673095',
          email: 'contract.toiral@gmail.com',
          socialMedia: []
        };
      }

      // Special case for community
      if (path === 'community') {
        defaultValue = {
          categories: {
            category1: {
              name: 'General Discussion',
              description: 'General topics and discussions about our services',
              order: 0
            },
            category2: {
              name: 'Questions & Support',
              description: 'Ask questions and get help from our community',
              order: 1
            }
          },
          topics: {},
          posts: {}
        };
      }

      // Special case for socialStats
      if (path === 'socialStats') {
        defaultValue = {
          facebook: 0,
          twitter: 0,
          instagram: 0,
          linkedin: 0,
          clients: 0,
          projects: 0
        };
      }

      // Special case for ads
      if (path === 'ads') {
        defaultValue = {
          ads: []
        };
      }

      // Special case for object-type paths
      if (path === 'notifications' || path === 'conversations') {
        defaultValue = {};
      }

      // Special case for about section
      if (path === 'about') {
        defaultValue = {
          story: 'Our company story...',
          teamMembers: [
            {
              id: Date.now().toString(),
              name: 'Team Member',
              role: 'Role',
              image: 'https://via.placeholder.com/200?text=Team+Member'
            }
          ]
        };
        console.log('Initializing about section with default team member:', defaultValue);

        // Force initialization of the about section
        try {
          await set(ref(database, path), defaultValue);
          console.log('About section initialized successfully with team members');
          return true;
        } catch (error) {
          console.error('Error initializing about section:', error);
        }
      }

      // Special case for PWA settings
      if (path === 'pwaSettings') {
        defaultValue = {
          appName: 'Toiral Web',
          shortName: 'Toiral',
          description: 'Toiral Web Development - Creating Tomorrow\'s Web, Today',
          themeColor: '#008080',
          backgroundColor: '#008080',
          displayMode: 'standalone',
          orientation: 'any',
          installPrompt: {
            title: 'Install Toiral Web',
            message: 'Install Toiral Web as an app on your device for a better experience.',
            buttonText: 'Install App',
            enabled: true
          },
          icons: {
            favicon: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
            appIcon192: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
            appIcon512: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
            maskableIcon: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png'
          },
          stats: {
            installCount: 0,
            installAttempts: 0,
            lastInstalled: null
          }
        };
      }

      // Special case for games settings
      if (path === 'games') {
        defaultValue = {
          games: [
            {
              id: 'reversi',
              name: 'Reversi',
              description: 'Classic Reversi/Othello game',
              icon: 'https://i.postimg.cc/7hbZhKjD/Chat.png',
              embedType: 'direct',
              embedUrl: 'https://playpager.com/embed/reversi/index.html',
              visible: true,
              order: 1,
              createdAt: Date.now(),
              updatedAt: Date.now()
            },
            {
              id: 'checkers',
              name: 'Checkers',
              description: 'Classic Checkers game',
              icon: 'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
              embedType: 'direct',
              embedUrl: 'https://playpager.com/embed/checkers/index.html',
              visible: true,
              order: 2,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ],
          showGames: true,
          title: 'Games',
          subtitle: 'Check out our collection of games',
          iconSize: 'medium' // Default icon size
        };
      }

      // Special case for mobile welcome message settings
      if (path === 'mobileWelcome') {
        defaultValue = {
          enabled: false,
          message: 'Welcome to Toiral Web - Swipe and tap to navigate',
          showOnlyOnFirstVisit: true,
          autoHideAfter: 5000 // milliseconds
        };
      }

      await set(ref(database, path), defaultValue);
      console.log(`Path ${path} initialized successfully with default value`);
      return true;
    } else {
      console.log(`Path ${path} already exists`);

      // Special handling for notifications path - ensure it's an object
      if (path === 'notifications') {
        const data = snapshot.val();
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          console.log('Notifications exists but is not an object, resetting to empty object');
          await set(ref(database, path), {});
        }
      }

      // Special handling for about path - ensure it has teamMembers array
      if (path === 'about') {
        const data = snapshot.val();
        console.log('About data from Firebase:', data);

        if (typeof data !== 'object' || data === null) {
          console.log('About exists but is not an object, resetting to default structure');
          const defaultAbout = {
            story: 'Our company story...',
            teamMembers: [
              {
                id: Date.now().toString(),
                name: 'Team Member',
                role: 'Role',
                image: 'https://via.placeholder.com/200?text=Team+Member'
              }
            ]
          };

          await set(ref(database, path), defaultAbout);
          console.log('About section initialized with default structure:', defaultAbout);
        } else if (!data.teamMembers || !Array.isArray(data.teamMembers)) {
          console.log('About exists but teamMembers is missing or not an array, adding default team member');
          const updatedAbout = {
            ...data,
            teamMembers: [
              {
                id: Date.now().toString(),
                name: 'Team Member',
                role: 'Role',
                image: 'https://via.placeholder.com/200?text=Team+Member'
              }
            ]
          };

          await set(ref(database, path), updatedAbout);
          console.log('About section updated with team members:', updatedAbout);
        } else {
          console.log('About section already has team members:', data.teamMembers);
        }
      }

      return false;
    }
  } catch (error) {
    console.error(`Error initializing path ${path}:`, error);
    return false;
  }
};

// Function to initialize all required paths
export const initializeRequiredPaths = async () => {
  const requiredPaths = [
    'toiral',
    'portfolio',
    'reviews',
    'contact',
    'bookings',
    'security',
    'profile',
    'theme',
    'company',
    'about',
    'services',
    'availableHours',
    'aboutUs',
    'notifications',
    'conversations',
    'pricing',
    'testimonialSettings',
    'analytics',
    'seo',
    'emailMarketing',
    'pwaSettings',
    'games',
    'mobileWelcome',
    'contactSubmissions',
    'contactInfo',
    'ads',
    'socialStats',
    'community'
  ];

  console.log('Initializing required paths...');

  for (const path of requiredPaths) {
    await initializePath(path);
  }

  console.log('All required paths initialized');
};

// Function to check if all required paths exist
export const checkRequiredPaths = async () => {
  const requiredPaths = [
    'toiral',
    'portfolio',
    'reviews',
    'contact',
    'bookings',
    'security',
    'profile',
    'theme',
    'company',
    'about',
    'services',
    'availableHours',
    'aboutUs',
    'notifications',
    'conversations',
    'pricing',
    'testimonialSettings',
    'analytics',
    'seo',
    'emailMarketing',
    'pwaSettings',
    'games',
    'mobileWelcome',
    'contactSubmissions',
    'contactInfo',
    'ads',
    'socialStats',
    'community'
  ];

  const results: Record<string, boolean> = {};

  for (const path of requiredPaths) {
    const snapshot = await get(ref(database, path));
    results[path] = snapshot.exists();
  }

  return results;
};
