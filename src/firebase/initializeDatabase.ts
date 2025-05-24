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
  services: {
    categories: [
      {
        id: 'web-development',
        name: 'Web Design & Development',
        description: 'Custom websites, e-commerce platforms, and web applications with modern design and functionality.',
        icon: 'code',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&h=200',
        order: 1,
        visible: true,
        color: '#3B82F6'
      },
      {
        id: 'graphic-design',
        name: 'Graphic Design & Branding',
        description: 'Logo design, brand identity, marketing materials, and visual communication solutions.',
        icon: 'palette',
        image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=400&h=200',
        order: 2,
        visible: true,
        color: '#EF4444'
      },
      {
        id: 'ui-ux-design',
        name: 'UI/UX & Digital Product Design',
        description: 'User interface design, user experience optimization, and digital product development.',
        icon: 'smartphone',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&h=200',
        order: 3,
        visible: true,
        color: '#10B981'
      },
      {
        id: 'consulting',
        name: 'Creative Consulting & Strategy',
        description: 'Brand strategy, creative direction, and business consulting for digital transformation.',
        icon: 'lightbulb',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&h=200',
        order: 4,
        visible: true,
        color: '#F59E0B'
      },
      {
        id: 'marketing',
        name: 'Marketing & Content Design',
        description: 'Digital marketing campaigns, content creation, and promotional material design.',
        icon: 'megaphone',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=200',
        order: 5,
        visible: true,
        color: '#8B5CF6'
      },
      {
        id: 'startup-support',
        name: 'Startup & Business Support',
        description: 'Complete business launch packages, branding kits, and entrepreneurial support services.',
        icon: 'rocket',
        image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=400&h=200',
        order: 6,
        visible: true,
        color: '#06B6D4'
      }
    ],
    packages: [
      {
        id: 'basic-website',
        name: 'Basic Website Package',
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
        icon: 'rocket',
        categoryId: 'web-development',
        duration: 'one-time',
        deliveryTime: '1-2 weeks'
      },
      {
        id: 'standard-website',
        name: 'Standard Website Package',
        tagline: 'Go Professional',
        description: 'Everything you need for a professional web presence with content management.',
        price: 999,
        features: [
          'Everything in Basic Package',
          'Admin panel for content management',
          'Menu, gallery, and booking management',
          'Hosting setup',
          'Email integration'
        ],
        popular: true,
        visible: true,
        order: 2,
        icon: 'star',
        categoryId: 'web-development',
        duration: 'one-time',
        deliveryTime: '2-3 weeks'
      },
      {
        id: 'premium-website',
        name: 'Premium Website Package',
        tagline: 'All-In-One Experience',
        description: 'The complete solution for businesses that want the best web experience.',
        price: 1999,
        features: [
          'Everything in Standard Package',
          'Fully custom UI/UX design',
          'Complete SEO optimization',
          'Analytics integration',
          'Priority support'
        ],
        popular: false,
        visible: true,
        order: 3,
        icon: 'diamond',
        categoryId: 'web-development',
        duration: 'one-time',
        deliveryTime: '3-4 weeks'
      },
      {
        id: 'logo-design',
        name: 'Professional Logo Design',
        tagline: 'Brand Identity',
        description: 'Custom logo design with multiple concepts and unlimited revisions.',
        price: 299,
        features: [
          '3 initial logo concepts',
          'Unlimited revisions',
          'Vector files (AI, EPS, SVG)',
          'High-resolution PNG/JPG',
          'Brand color palette',
          'Typography recommendations'
        ],
        popular: true,
        visible: true,
        order: 1,
        icon: 'star',
        categoryId: 'graphic-design',
        duration: 'one-time',
        deliveryTime: '5-7 days'
      },
      {
        id: 'brand-package',
        name: 'Complete Brand Package',
        tagline: 'Full Brand Identity',
        description: 'Comprehensive branding solution including logo, guidelines, and marketing materials.',
        price: 799,
        features: [
          'Professional logo design',
          'Brand guidelines document',
          'Business card design',
          'Letterhead design',
          'Social media templates',
          'Brand color & typography guide'
        ],
        popular: false,
        visible: true,
        order: 2,
        icon: 'diamond',
        categoryId: 'graphic-design',
        duration: 'one-time',
        deliveryTime: '1-2 weeks'
      },
      {
        id: 'app-ui-design',
        name: 'Mobile App UI Design',
        tagline: 'Modern Interface',
        description: 'Professional mobile app interface design with user experience optimization.',
        price: 599,
        features: [
          'Complete app screen designs',
          'User flow optimization',
          'Interactive prototypes',
          'Design system creation',
          'iOS & Android compatibility',
          'Figma source files'
        ],
        popular: true,
        visible: true,
        order: 1,
        icon: 'smartphone',
        categoryId: 'ui-ux-design',
        duration: 'one-time',
        deliveryTime: '2-3 weeks'
      },
      {
        id: 'web-dashboard-ui',
        name: 'Web Dashboard UI Design',
        tagline: 'Data Visualization',
        description: 'Custom dashboard design for web applications with data visualization.',
        price: 899,
        features: [
          'Custom dashboard layout',
          'Data visualization components',
          'Responsive design',
          'User role management UI',
          'Interactive elements',
          'Style guide included'
        ],
        popular: false,
        visible: true,
        order: 2,
        icon: 'star',
        categoryId: 'ui-ux-design',
        duration: 'one-time',
        deliveryTime: '2-4 weeks'
      },
      {
        id: 'brand-consulting',
        name: 'Brand Strategy Consultation',
        tagline: 'Strategic Direction',
        description: 'Comprehensive brand strategy development and market positioning.',
        price: 399,
        features: [
          'Brand audit & analysis',
          'Market research insights',
          'Brand positioning strategy',
          'Competitor analysis',
          'Brand messaging framework',
          'Implementation roadmap'
        ],
        popular: false,
        visible: true,
        order: 1,
        icon: 'lightbulb',
        categoryId: 'consulting',
        duration: 'one-time',
        deliveryTime: '1-2 weeks'
      },
      {
        id: 'creative-direction',
        name: 'Creative Direction Package',
        tagline: 'Vision & Execution',
        description: 'End-to-end creative direction for marketing campaigns and brand initiatives.',
        price: 799,
        features: [
          'Creative concept development',
          'Visual style direction',
          'Campaign strategy',
          'Asset creation guidelines',
          'Team collaboration',
          'Project management'
        ],
        popular: true,
        visible: true,
        order: 2,
        icon: 'star',
        categoryId: 'consulting',
        duration: 'one-time',
        deliveryTime: '2-3 weeks'
      },
      {
        id: 'social-media-campaign',
        name: 'Social Media Ad Campaign',
        tagline: 'Digital Reach',
        description: 'Complete social media advertising campaign design and strategy.',
        price: 499,
        features: [
          'Platform-specific ad designs',
          'Campaign strategy development',
          'A/B testing variations',
          'Performance tracking setup',
          'Content calendar',
          'Analytics reporting'
        ],
        popular: true,
        visible: true,
        order: 1,
        icon: 'megaphone',
        categoryId: 'marketing',
        duration: 'one-time',
        deliveryTime: '1-2 weeks'
      },
      {
        id: 'presentation-design',
        name: 'Professional Presentation Design',
        tagline: 'Impactful Presentations',
        description: 'Custom presentation and pitch deck design for business and marketing.',
        price: 299,
        features: [
          'Custom slide templates',
          'Data visualization',
          'Brand-consistent design',
          'Animation effects',
          'Multiple format exports',
          'Revision rounds included'
        ],
        popular: false,
        visible: true,
        order: 2,
        icon: 'star',
        categoryId: 'marketing',
        duration: 'one-time',
        deliveryTime: '5-7 days'
      },
      {
        id: 'startup-branding-kit',
        name: 'Startup Branding Kit',
        tagline: 'Launch Ready',
        description: 'Complete branding package designed specifically for startup launches.',
        price: 1299,
        features: [
          'Logo & brand identity',
          'Website design & development',
          'Business card & stationery',
          'Social media templates',
          'Pitch deck template',
          'Brand guidelines document'
        ],
        popular: true,
        visible: true,
        order: 1,
        icon: 'rocket',
        categoryId: 'startup-support',
        duration: 'one-time',
        deliveryTime: '3-4 weeks'
      },
      {
        id: 'business-strategy',
        name: 'Business Idea Strategy',
        tagline: 'Strategic Foundation',
        description: 'Comprehensive business strategy development and validation for new ventures.',
        price: 699,
        features: [
          'Business model development',
          'Market validation research',
          'Competitive analysis',
          'Revenue strategy planning',
          'Go-to-market strategy',
          'Implementation timeline'
        ],
        popular: false,
        visible: true,
        order: 2,
        icon: 'lightbulb',
        categoryId: 'startup-support',
        duration: 'one-time',
        deliveryTime: '2-3 weeks'
      }
    ],
    addons: [
      {
        id: 'logo-addon',
        name: 'Logo Design',
        description: 'Professional logo design with multiple revisions.',
        price: 50,
        visible: true,
        categoryId: 'graphic-design'
      },
      {
        id: 'email-setup',
        name: 'Business Email Setup',
        description: 'Setup professional email addresses for your business.',
        price: 30,
        visible: true
      },
      {
        id: 'booking-system',
        name: 'Booking System Integration',
        description: 'Allow customers to book appointments directly from your website.',
        price: 100,
        visible: true,
        categoryId: 'web-development'
      },
      {
        id: 'maintenance',
        name: 'Monthly Maintenance',
        description: 'Regular updates, security patches, and content changes.',
        price: 50,
        visible: true
      },
      {
        id: 'seo-optimization',
        name: 'SEO Optimization',
        description: 'Complete search engine optimization for better visibility.',
        price: 150,
        visible: true,
        categoryId: 'web-development'
      },
      {
        id: 'social-media-kit',
        name: 'Social Media Kit',
        description: 'Complete set of social media templates and graphics.',
        price: 75,
        visible: true,
        categoryId: 'graphic-design'
      },
      {
        id: 'user-testing',
        name: 'User Testing & Research',
        description: 'Comprehensive user testing and usability research.',
        price: 200,
        visible: true,
        categoryId: 'ui-ux-design'
      },
      {
        id: 'market-research',
        name: 'Market Research Report',
        description: 'Detailed market analysis and competitor research.',
        price: 120,
        visible: true,
        categoryId: 'consulting'
      },
      {
        id: 'content-creation',
        name: 'Content Creation Package',
        description: 'Blog posts, social media content, and marketing copy.',
        price: 100,
        visible: true,
        categoryId: 'marketing'
      },
      {
        id: 'pitch-deck',
        name: 'Investor Pitch Deck',
        description: 'Professional pitch deck for investor presentations.',
        price: 250,
        visible: true,
        categoryId: 'startup-support'
      }
    ],
    currency: '$',
    showServices: true,
    title: 'Our Services',
    subtitle: 'Comprehensive digital solutions for your business needs'
  },
  serviceTypes: [{
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
