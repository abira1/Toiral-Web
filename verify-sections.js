// This script verifies that all required sections are properly configured and visible
// Run this script with Node.js: node verify-sections.js

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

// Required sections
const requiredSections = [
  'about', // Toiral
  'portfolio',
  'book', // Book Appointment
  'reviews',
  'pricing',
  'contact', // Contact Us
  'community'
];

// Function to verify that all required sections are properly configured and visible
async function verifySections() {
  try {
    console.log('Verifying sections...');
    
    // Get current theme settings
    const themeRef = ref(database, 'theme');
    const snapshot = await get(themeRef);
    
    if (!snapshot.exists()) {
      console.log('Theme settings not found. Please run ensure-sections.js first.');
      return;
    }
    
    // Theme settings exist, check if sections are properly configured
    const themeData = snapshot.val();
    
    if (!themeData.sections || !Array.isArray(themeData.sections)) {
      console.log('Sections not found or invalid. Please run ensure-sections.js first.');
      return;
    }
    
    // Check if all required sections exist and are visible
    const existingSections = themeData.sections.filter(section => requiredSections.includes(section.id));
    const missingSections = requiredSections.filter(id => !existingSections.some(section => section.id === id));
    const invisibleSections = existingSections.filter(section => !section.visible);
    
    console.log('Required sections:', requiredSections);
    console.log('Existing sections:', existingSections.map(section => section.id));
    console.log('Missing sections:', missingSections);
    console.log('Invisible sections:', invisibleSections.map(section => section.id));
    
    if (missingSections.length > 0) {
      console.log(`Found ${missingSections.length} missing sections: ${missingSections.join(', ')}`);
      console.log('Please run ensure-sections.js to add the missing sections.');
    } else if (invisibleSections.length > 0) {
      console.log(`Found ${invisibleSections.length} invisible sections: ${invisibleSections.map(section => section.id).join(', ')}`);
      
      // Make all sections visible
      const updatedSections = themeData.sections.map(section => 
        requiredSections.includes(section.id) ? { ...section, visible: true } : section
      );
      
      themeData.sections = updatedSections;
      await set(themeRef, themeData);
      console.log('All required sections are now visible!');
    } else {
      console.log('All required sections are properly configured and visible!');
    }
    
    // Print the current order of sections
    const orderedSections = [...themeData.sections]
      .filter(section => requiredSections.includes(section.id))
      .sort((a, b) => a.order - b.order);
    
    console.log('Current order of sections:');
    orderedSections.forEach(section => {
      console.log(`${section.order}. ${section.label} (${section.id})`);
    });
  } catch (error) {
    console.error('Error verifying sections:', error);
  }
}

// Run the function
verifySections();
