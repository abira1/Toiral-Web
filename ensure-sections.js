// This script ensures all required sections are properly configured in the theme settings
// Run this script with Node.js: node ensure-sections.js

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

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

// Default sections configuration
const defaultSections = [
  {
    id: 'about',
    label: 'Toiral',
    icon: 'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
    order: 1,
    visible: true
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: 'https://i.postimg.cc/15k3RcBh/Portfolio.png',
    order: 2,
    visible: true
  },
  {
    id: 'book',
    label: 'Appointments',
    icon: 'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
    order: 3,
    visible: true
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'https://i.postimg.cc/cLf4vgkK/Review.png',
    order: 4,
    visible: true
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: 'https://i.postimg.cc/RCb0yzn0/Contact.png',
    order: 5,
    visible: true
  },
  {
    id: 'pricing',
    label: 'Pricing',
    icon: 'https://i.postimg.cc/Kz9zZLJV/dollar-sign.png',
    order: 6,
    visible: true
  },
  {
    id: 'community',
    label: 'Community',
    icon: '/assets/images/community.png',
    order: 7,
    visible: true
  },
  {
    id: 'chat',
    label: 'Live Chat',
    icon: 'https://i.postimg.cc/7hbZhKjD/Chat.png',
    order: 8,
    visible: true
  },
  {
    id: 'games',
    label: 'Games',
    icon: '/assets/images/games.png',
    order: 9,
    visible: true,
    startMenuOnly: true
  },
  {
    id: 'reversi',
    label: 'Reversi',
    icon: '/assets/images/reversi.png',
    order: 10,
    visible: true,
    startMenuOnly: true
  },
  {
    id: 'checkers',
    label: 'Checkers',
    icon: '/assets/images/checkers.png',
    order: 11,
    visible: true,
    startMenuOnly: true
  }
];

// Function to ensure all required sections are properly configured
async function ensureSections() {
  try {
    console.log('Checking theme settings...');
    
    // Get current theme settings
    const themeRef = ref(database, 'theme');
    const snapshot = await get(themeRef);
    
    if (!snapshot.exists()) {
      console.log('Theme settings not found. Creating default theme settings...');
      await set(themeRef, {
        backgroundColor: 'rgb(20 184 166)',
        backgroundImage: null,
        useBackgroundImage: false,
        accentColor: 'rgb(30 58 138)',
        clockVisible: true,
        clockTimezone: 'Asia/Dhaka',
        desktopIcons: {
          visible: true,
          position: 'left',
          size: 'medium'
        },
        menuIcons: {
          size: 'medium'
        },
        chatbotName: 'Toiral',
        dialogDefaultWidth: 800,
        themeMode: 'default',
        sections: defaultSections
      });
      console.log('Default theme settings created successfully!');
      return;
    }
    
    // Theme settings exist, check if sections are properly configured
    const themeData = snapshot.val();
    
    if (!themeData.sections || !Array.isArray(themeData.sections)) {
      console.log('Sections not found or invalid. Adding default sections...');
      themeData.sections = defaultSections;
      await set(themeRef, themeData);
      console.log('Default sections added successfully!');
      return;
    }
    
    // Check if all required sections exist
    const existingSectionIds = themeData.sections.map(section => section.id);
    const missingSections = defaultSections.filter(section => !existingSectionIds.includes(section.id));
    
    if (missingSections.length > 0) {
      console.log(`Found ${missingSections.length} missing sections. Adding them...`);
      
      // Add missing sections
      const updatedSections = [
        ...themeData.sections,
        ...missingSections.map(section => ({
          ...section,
          order: themeData.sections.length + missingSections.indexOf(section) + 1
        }))
      ];
      
      themeData.sections = updatedSections;
      await set(themeRef, themeData);
      console.log('Missing sections added successfully!');
    } else {
      console.log('All required sections are already configured.');
      
      // Ensure all sections are visible
      const invisibleSections = themeData.sections.filter(section => section.visible === false);
      
      if (invisibleSections.length > 0) {
        console.log(`Found ${invisibleSections.length} invisible sections. Making them visible...`);
        
        // Make all sections visible
        const updatedSections = themeData.sections.map(section => ({
          ...section,
          visible: true
        }));
        
        themeData.sections = updatedSections;
        await set(themeRef, themeData);
        console.log('All sections are now visible!');
      }
    }
    
    console.log('Section configuration check completed successfully!');
  } catch (error) {
    console.error('Error ensuring sections:', error);
  }
}

// Run the function
ensureSections();
