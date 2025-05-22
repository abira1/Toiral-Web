import { database } from '../firebase/config';
import { ref, set } from 'firebase/database';

// Sample portfolio data
const portfolioData = {
  'folder1': {
    id: 'folder1',
    name: 'Web Projects',
    type: 'folder',
    dateCreated: Date.now() - 30 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 5 * 24 * 60 * 60 * 1000,
    parentFolder: '/'
  },
  'folder2': {
    id: 'folder2',
    name: 'Mobile Apps',
    type: 'folder',
    dateCreated: Date.now() - 60 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 10 * 24 * 60 * 60 * 1000,
    parentFolder: '/'
  },
  'folder3': {
    id: 'folder3',
    name: 'Design Work',
    type: 'folder',
    dateCreated: Date.now() - 90 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 15 * 24 * 60 * 60 * 1000,
    parentFolder: '/'
  },
  'file1': {
    id: 'file1',
    name: 'Portfolio Overview',
    type: 'file',
    extension: 'txt',
    size: 2048,
    dateCreated: Date.now() - 120 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 20 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'An overview of my portfolio and skills',
    content: `# Portfolio Overview

Welcome to my portfolio! I specialize in web development, mobile app development, and UI/UX design.

## Skills
- Frontend: React, Vue, Angular
- Backend: Node.js, Express, Firebase
- Mobile: React Native, Flutter
- Design: Figma, Adobe XD, Photoshop

## Experience
I have over 5 years of experience building web and mobile applications for clients across various industries.

Feel free to explore my projects in the folders!`
  },
  'file2': {
    id: 'file2',
    name: 'Contact Information',
    type: 'file',
    extension: 'txt',
    size: 1024,
    dateCreated: Date.now() - 150 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 25 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'My contact information',
    content: `# Contact Information

Email: contact@example.com
Phone: (123) 456-7890
Website: www.example.com

## Social Media
- LinkedIn: linkedin.com/in/example
- GitHub: github.com/example
- Twitter: @example

Feel free to reach out for collaboration opportunities!`
  },
  'file3': {
    id: 'file3',
    name: 'Company Logo',
    type: 'file',
    extension: 'png',
    size: 1048576,
    url: 'https://via.placeholder.com/500x500?text=Logo',
    dateCreated: Date.now() - 180 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 30 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'Company logo design'
  },
  'file4': {
    id: 'file4',
    name: 'Website Mockup',
    type: 'file',
    extension: 'jpg',
    size: 2097152,
    url: 'https://via.placeholder.com/1200x800?text=Website+Mockup',
    dateCreated: Date.now() - 210 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 35 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'Website design mockup'
  },
  'file5': {
    id: 'file5',
    name: 'Project Proposal',
    type: 'file',
    extension: 'pdf',
    size: 3145728,
    dateCreated: Date.now() - 240 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 40 * 24 * 60 * 60 * 1000,
    parentFolder: '/',
    description: 'Project proposal document'
  },
  'file6': {
    id: 'file6',
    name: 'E-commerce Website',
    type: 'file',
    extension: 'txt',
    size: 1536,
    dateCreated: Date.now() - 45 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 5 * 24 * 60 * 60 * 1000,
    parentFolder: '/Web Projects',
    description: 'E-commerce website project details',
    content: `# E-commerce Website

## Project Overview
A fully responsive e-commerce website built with React and Node.js.

## Features
- User authentication
- Product catalog
- Shopping cart
- Payment processing
- Order tracking

## Technologies
- Frontend: React, Redux, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Payment: Stripe API
- Hosting: AWS

## Timeline
Development completed in 3 months.`
  },
  'file7': {
    id: 'file7',
    name: 'Portfolio Website',
    type: 'file',
    extension: 'txt',
    size: 1280,
    dateCreated: Date.now() - 50 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 10 * 24 * 60 * 60 * 1000,
    parentFolder: '/Web Projects',
    description: 'Portfolio website project details',
    content: `# Portfolio Website

## Project Overview
A personal portfolio website with a unique Windows 95 aesthetic.

## Features
- Interactive desktop interface
- Project showcase
- Contact form
- Blog section

## Technologies
- React
- Firebase
- Tailwind CSS
- Framer Motion

## Timeline
Development completed in 2 months.`
  },
  'file8': {
    id: 'file8',
    name: 'Food Delivery App',
    type: 'file',
    extension: 'txt',
    size: 1792,
    dateCreated: Date.now() - 55 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 15 * 24 * 60 * 60 * 1000,
    parentFolder: '/Mobile Apps',
    description: 'Food delivery app project details',
    content: `# Food Delivery App

## Project Overview
A mobile app for food ordering and delivery tracking.

## Features
- User registration and profiles
- Restaurant browsing
- Menu viewing and ordering
- Real-time delivery tracking
- Payment integration

## Technologies
- React Native
- Firebase
- Google Maps API
- Stripe

## Timeline
Development completed in 4 months.`
  },
  'file9': {
    id: 'file9',
    name: 'Fitness Tracker',
    type: 'file',
    extension: 'txt',
    size: 1408,
    dateCreated: Date.now() - 60 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 20 * 24 * 60 * 60 * 1000,
    parentFolder: '/Mobile Apps',
    description: 'Fitness tracker app project details',
    content: `# Fitness Tracker App

## Project Overview
A mobile app for tracking workouts, nutrition, and fitness goals.

## Features
- Workout planning and tracking
- Nutrition logging
- Progress visualization
- Goal setting
- Social sharing

## Technologies
- Flutter
- Firebase
- HealthKit/Google Fit integration
- Charts.js

## Timeline
Development completed in 3 months.`
  },
  'file10': {
    id: 'file10',
    name: 'Brand Identity',
    type: 'file',
    extension: 'txt',
    size: 1664,
    dateCreated: Date.now() - 65 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 25 * 24 * 60 * 60 * 1000,
    parentFolder: '/Design Work',
    description: 'Brand identity project details',
    content: `# Brand Identity Project

## Project Overview
Complete brand identity design for a tech startup.

## Deliverables
- Logo design
- Color palette
- Typography
- Brand guidelines
- Marketing materials
- Website design

## Process
1. Research and discovery
2. Concept development
3. Design refinement
4. Final delivery

## Timeline
Project completed in 6 weeks.`
  },
  'file11': {
    id: 'file11',
    name: 'UI/UX Design',
    type: 'file',
    extension: 'txt',
    size: 1920,
    dateCreated: Date.now() - 70 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 30 * 24 * 60 * 60 * 1000,
    parentFolder: '/Design Work',
    description: 'UI/UX design project details',
    content: `# UI/UX Design Project

## Project Overview
User interface and experience design for a financial app.

## Deliverables
- User research
- User personas
- User flows
- Wireframes
- High-fidelity mockups
- Interactive prototype

## Tools
- Figma
- Adobe XD
- Miro
- InVision

## Timeline
Project completed in 2 months.`
  },
  'file12': {
    id: 'file12',
    name: 'Logo Design',
    type: 'file',
    extension: 'png',
    size: 1048576,
    url: 'https://via.placeholder.com/500x500?text=Logo+Design',
    dateCreated: Date.now() - 75 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 35 * 24 * 60 * 60 * 1000,
    parentFolder: '/Design Work',
    description: 'Logo design for a client'
  },
  'file13': {
    id: 'file13',
    name: 'Mobile App Mockup',
    type: 'file',
    extension: 'jpg',
    size: 2097152,
    url: 'https://via.placeholder.com/375x812?text=App+Mockup',
    dateCreated: Date.now() - 80 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 40 * 24 * 60 * 60 * 1000,
    parentFolder: '/Mobile Apps',
    description: 'Mobile app design mockup'
  },
  'file14': {
    id: 'file14',
    name: 'Website Screenshot',
    type: 'file',
    extension: 'jpg',
    size: 1572864,
    url: 'https://via.placeholder.com/1200x800?text=Website+Screenshot',
    dateCreated: Date.now() - 85 * 24 * 60 * 60 * 1000,
    dateModified: Date.now() - 45 * 24 * 60 * 60 * 1000,
    parentFolder: '/Web Projects',
    description: 'Screenshot of a completed website'
  }
};

// Function to initialize portfolio data
export const initializePortfolioData = async () => {
  try {
    const portfolioRef = ref(database, 'portfolio');
    await set(portfolioRef, portfolioData);
    console.log('Portfolio data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing portfolio data:', error);
    return false;
  }
};

// Export the data for direct use
export { portfolioData };
