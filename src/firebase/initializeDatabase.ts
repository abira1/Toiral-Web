import { ref, set } from 'firebase/database';
import { database } from './config';

// Default data for the database
const defaultData = {
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
  portfolio: [{
    id: '1',
    title: 'E-commerce Platform',
    description: 'Modern shopping experience with retro aesthetics',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300',
    url: 'https://example.com/project1'
  }],
  reviews: [{
    id: '1',
    name: 'John D.',
    rating: 5,
    review: 'Exceptional service and attention to detail...',
    date: new Date().toISOString(),
    approved: true
  }],
  contact: {
    officeHours: {
      days: 'Monday - Friday',
      hours: '9:00 AM - 6:00 PM',
      timezone: 'GMT+6'
    },
    phone: '+880 1804-673095',
    email: 'contract.toiral@gmail.com',
    socialMedia: {
      facebook: 'https://www.facebook.com/toiral',
      instagram: 'https://www.instagram.com/toiral.offical'
    }
  },
  services: [{
    id: '1',
    name: 'Initial Consultation',
    duration: '30 mins',
    price: 'Free',
    color: 'green'
  }],
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
  },
  pricing: {
    packages: [
      {
        id: 'basic',
        name: 'Basic Package',
        tagline: 'Start Strong',
        description: 'Perfect for small businesses looking to establish an online presence.',
        price: 499,
        features: [
          'Custom-designed single-page website',
          'Mobile & desktop responsiveness',
          'Menu, About, Gallery sections',
          'Reviews and Contact sections',
          'Basic SEO setup'
        ],
        popular: false,
        visible: true,
        order: 1,
        icon: 'rocket'
      },
      {
        id: 'standard',
        name: 'Standard Package',
        tagline: 'Grow Your Business',
        description: 'Comprehensive solution for businesses ready to expand their digital footprint.',
        price: 999,
        features: [
          'Everything in Basic Package',
          'Multi-page website (up to 5 pages)',
          'Content management system',
          'Social media integration',
          'Google Analytics setup',
          'Basic email marketing setup'
        ],
        popular: true,
        visible: true,
        order: 2,
        icon: 'star'
      },
      {
        id: 'premium',
        name: 'Premium Package',
        tagline: 'Complete Solution',
        description: 'All-inclusive package for businesses seeking a comprehensive online presence.',
        price: 1999,
        features: [
          'Everything in Standard Package',
          'E-commerce functionality',
          'Custom web application features',
          'Advanced SEO optimization',
          'Premium hosting & security',
          'Priority support & maintenance',
          'Monthly performance reports'
        ],
        popular: false,
        visible: true,
        order: 3,
        icon: 'diamond'
      }
    ],
    addons: [
      {
        id: 'logo',
        name: 'Logo Design',
        description: 'Professional logo design with multiple revisions.',
        price: 50,
        visible: true
      },
      {
        id: 'email',
        name: 'Business Email Setup',
        description: 'Setup professional email addresses for your business.',
        price: 30,
        visible: true
      },
      {
        id: 'booking',
        name: 'Booking System Integration',
        description: 'Allow customers to book appointments directly from your website.',
        price: 100,
        visible: true
      },
      {
        id: 'maintenance',
        name: 'Monthly Maintenance',
        description: 'Regular updates, security patches, and content changes.',
        price: 50,
        visible: true
      }
    ],
    currency: '$',
    showPricing: true,
    title: 'Our Pricing Plans',
    subtitle: 'Choose the perfect package for your business needs'
  }
};

/**
 * Initialize the database with default data
 * This should only be run once when setting up a new project
 */
export const initializeDatabase = async () => {
  try {
    // Set the default data
    await set(ref(database), defaultData);
    console.log('Database initialized with default data');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

/**
 * Reset a specific section of the database
 * @param section The section to reset (e.g., 'reviews', 'bookings')
 */
export const resetDatabaseSection = async (section: string) => {
  try {
    if (section in defaultData) {
      await set(ref(database, section), defaultData[section as keyof typeof defaultData]);
      console.log(`Database section ${section} reset to default`);
      return true;
    } else {
      console.error(`Section ${section} not found in default data`);
      return false;
    }
  } catch (error) {
    console.error(`Error resetting database section ${section}:`, error);
    return false;
  }
};

/**
 * Reset the entire database to default values
 */
export const resetEntireDatabase = async () => {
  try {
    await initializeDatabase();
    console.log('Database reset to default values');
    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    return false;
  }
};
