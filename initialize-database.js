// This script initializes all required database paths with default data
// Run this script with Node.js: node initialize-database.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

// Firebase configuration for toiral-development
const firebaseConfig = {
  apiKey: "AIzaSyDZDlwmPMVR2n7LIj_9syKhKKCepIEWw_Q",
  authDomain: "toiral-development.firebaseapp.com",
  databaseURL: "https://toiral-development-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "toiral-development",
  storageBucket: "toiral-development.firebasestorage.app",
  messagingSenderId: "408992435427",
  appId: "1:408992435427:web:0e06bd843d788c80ca89d6",
  measurementId: "G-YHZT50WVTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Default data for all required paths
const defaultData = {
  toiral: {
    name: 'Toiral Web Development',
    tagline: 'Creating Tomorrow\'s Web, Today',
    description: 'We build modern web applications with a retro aesthetic.'
  },
  portfolio: [
    {
      id: '1',
      title: 'E-commerce Platform',
      description: 'Modern shopping experience with retro aesthetics',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300',
      url: 'https://example.com/project1'
    },
    {
      id: '2',
      title: 'Portfolio Website',
      description: 'Showcasing creative work with a nostalgic interface',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=300',
      url: 'https://example.com/project2'
    }
  ],
  reviews: [],
  contact: {
    email: 'contract.toiral@gmail.com',
    phone: '+880 1804-673095',
    address: '123 Web Street, Digital City',
    hours: 'Monday - Friday, 9:00 AM - 6:00 PM'
  },
  bookings: [],
  security: {
    adminEmails: ['abirsabirhossain@gmail.com']
  },
  theme: {
    primaryColor: '#008080',
    secondaryColor: '#c0c0c0',
    sections: []
  },
  pricing: {
    packages: [],
    addons: [],
    currency: '$',
    showPricing: true,
    title: 'Our Pricing Plans',
    subtitle: 'Choose the perfect package for your business needs'
  },
  contactSubmissions: [],
  contactInfo: {
    officeHours: {
      days: 'Monday - Friday',
      hours: '9:00 AM - 6:00 PM',
      timezone: 'GMT+6'
    },
    phone: '+880 1804-673095',
    email: 'contract.toiral@gmail.com',
    socialMedia: []
  },
  ads: {
    enabled: false,
    positions: {
      header: false,
      sidebar: false,
      footer: false
    },
    currentAds: []
  },
  notifications: [],
  socialStats: {
    followers: 0,
    likes: 0,
    shares: 0
  },
  community: {
    members: 0,
    posts: []
  },
  company: {
    name: 'Toiral Web Development',
    tagline: "Creating Tomorrow's Web, Today",
    logo: "/toiral.png",
    headerImage: 'https://via.placeholder.com/1200x400'
  },
  about: {
    story: 'Founded in 2023, Toiral emerged from a shared vision to revolutionize digital experiences...',
    teamMembers: [{
      id: '1',
      name: 'Alex Thompson',
      role: 'CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100'
    }]
  },
  services: [
    {
      id: '1',
      title: 'Web Development',
      description: 'Custom websites with modern functionality and retro aesthetics',
      icon: 'code',
      price: 'From $1,000'
    },
    {
      id: '2',
      title: 'UI/UX Design',
      description: 'User-friendly interfaces with nostalgic design elements',
      icon: 'palette',
      price: 'From $800'
    }
  ],
  availableHours: [9, 10, 11, 13, 14, 15, 16],
  aboutUs: {
    vision: 'At Toiral, we envision a digital landscape where nostalgia meets innovation...',
    story: 'Founded in 2023, Toiral began as a passion project...',
    gallery: [{
      id: '1',
      url: 'https://via.placeholder.com/400x300',
      caption: 'Our main office'
    }],
    welcomeText: 'Welcome to Toiral - Where Retro Meets Modern'
  }
};

// Function to initialize a specific path
async function initializePath(path) {
  try {
    console.log(`Initializing path: ${path}`);
    const pathRef = ref(database, path);
    const snapshot = await get(pathRef);

    if (snapshot.exists()) {
      console.log(`Path ${path} already exists, skipping...`);
      return true;
    } else {
      await set(pathRef, defaultData[path]);
      console.log(`Path ${path} initialized successfully!`);
      return true;
    }
  } catch (error) {
    console.error(`Error initializing path ${path}:`, error);
    return false;
  }
}

// Function to initialize all paths
async function initializeAllPaths() {
  const paths = Object.keys(defaultData);
  const results = {};

  console.log('Starting database initialization...');

  for (const path of paths) {
    results[path] = await initializePath(path);
  }

  console.log('Database initialization completed!');
  console.log('Results:', results);
}

// Run the initialization
initializeAllPaths();
