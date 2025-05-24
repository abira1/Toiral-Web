import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { ref, set, get, update, onValue } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from './AuthContext';
import {
  subscribeToBookings,
  subscribeToReviews,
  subscribeToContactSubmissions,
  subscribeToChatMessages,
  updateBookingStatus as updateFirebaseBookingStatus,
  updateReviewApproval,
  deleteReview,
  updateContactStatus,
  deleteContactSubmission,
  addBooking as addFirebaseBooking,
  addContactSubmission as addFirebaseContactSubmission
} from '../firebase';
import {
  BookingSubmission,
  CompanyProfile,
  ContactFormSubmission,
  ContactInfo,
  ContentSettings as ContentSettingsType,
  PortfolioItem,
  ServiceType,
  TeamMember
} from '../types';


// Use the imported type
type ContentSettings = ContentSettingsType;
// Define loading state for data loading
interface DataLoadingState {
  isLoading: boolean;
  progress: Record<string, boolean>;
  lastUpdated: Record<string, number>;
  isRefreshing: boolean;
}

interface ContentContextType {
  content: ContentSettings;
  updateContent: (newContent: Partial<ContentSettings>) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  addPortfolioItem: (item: PortfolioItem) => void;
  removePortfolioItem: (id: string) => void;
  updateReview: (id: string, approved: boolean) => void;
  removeReview: (id: string) => void;
  updateContactInfo: (info: Partial<ContactInfo>) => void;
  updateServiceTypes: (serviceTypes: ServiceType[]) => void;
  addBooking: (booking: Omit<BookingSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  updateBookingStatus: (id: string, status: BookingSubmission['status']) => void;
  removeBooking: (id: string) => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  updateContactSubmissionStatus: (id: string, status: ContactFormSubmission['status']) => void;
  removeContactSubmission: (id: string) => void;
  addContactSubmission: (submission: Omit<ContactFormSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  updateNotificationStatus: (id: string, read: boolean) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // New methods for data loading
  loadingState: DataLoadingState;
  preloadEssentialData: () => Promise<boolean>;
  refreshData: (path?: string) => Promise<void>;
}
const defaultContent: ContentSettingsType = {
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
    date: 'Dec 2023',
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
  serviceTypes: [{
    id: '1',
    name: 'Initial Consultation',
    duration: '30 mins',
    price: 'Free',
    color: 'green'
  }],
  availableHours: [9, 10, 11, 13, 14, 15, 16],
  bookings: [],
  contactSubmissions: [],
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
  chatMessages: [],
  notifications: {},
  conversations: {},
  services: {
    categories: [
      {
        id: 'web-development',
        name: 'Web Design & Development',
        description: 'Custom websites, e-commerce platforms, and web applications with modern design and functionality.',
        icon: 'code',
        order: 1,
        visible: true,
        color: '#3B82F6'
      },
      {
        id: 'graphic-design',
        name: 'Graphic Design & Branding',
        description: 'Logo design, brand identity, marketing materials, and visual communication solutions.',
        icon: 'palette',
        order: 2,
        visible: true,
        color: '#EF4444'
      },
      {
        id: 'ui-ux-design',
        name: 'UI/UX & Digital Product Design',
        description: 'User interface design, user experience optimization, and digital product development.',
        icon: 'smartphone',
        order: 3,
        visible: true,
        color: '#10B981'
      }
    ],
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
        icon: 'rocket',
        categoryId: 'web-development'
      },
      {
        id: 'standard',
        name: 'Standard Package',
        tagline: 'Go Functional',
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
        categoryId: 'web-development'
      },
      {
        id: 'premium',
        name: 'Premium Package',
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
        categoryId: 'web-development'
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
    showServices: true,
    title: 'Our Services',
    subtitle: 'Comprehensive digital solutions for your business needs'
  },
  // Legacy pricing structure for backward compatibility
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
        icon: 'rocket',
        categoryId: 'web-development'
      }
    ],
    addons: [],
    currency: '$',
    showPricing: true,
    title: 'Our Services',
    subtitle: 'Comprehensive digital solutions for your business needs'
  },
  // Add missing required properties
  toiral: {},
  security: {},
  profile: {},
  theme: {},
  // Initialize new business growth features with empty objects
  testimonialSettings: {
    displayMode: 'grid',
    autoRotate: true,
    rotationSpeed: 5,
    showRating: true,
    maxDisplayCount: 6,
    backgroundColor: '#f0f0f0',
    textColor: '#333333',
    accentColor: '#3B82F6'
  },
  analytics: {
    pageViews: {},
    visitors: {
      totalVisitors: 0,
      newVisitors: 0,
      returningVisitors: 0,
      lastUpdated: Date.now()
    },
    devices: {
      desktop: 0,
      mobile: 0,
      tablet: 0
    },
    bounceRate: 0,
    avgSessionDuration: 0,
    dailyVisitors: {}
  },
  seo: {
    title: 'Toiral Web Development',
    description: 'Creating Tomorrow\'s Web, Today',
    keywords: 'web development, design, retro, windows 95',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    canonicalUrl: '',
    structuredData: '{}',
    metaTags: [],
    robotsTxt: 'User-agent: *\nAllow: /',
    sitemapXml: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n    <lastmod>2023-01-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>'
  },
  emailMarketing: {
    subscribers: {},
    templates: {},
    campaigns: {},
    settings: {
      senderName: 'Toiral Web Development',
      senderEmail: 'contract.toiral@gmail.com',
      replyToEmail: 'contract.toiral@gmail.com',
      signupFormEnabled: true,
      doubleOptIn: true,
      welcomeEmailEnabled: true,
      welcomeEmailSubject: 'Welcome to Toiral Web Development',
      welcomeEmailContent: 'Thank you for subscribing to our newsletter!'
    }
  },
  games: {
    games: [],
    showGames: true,
    title: 'Games',
    subtitle: 'Check out our collection of games'
  },
  mobileWelcome: {
    enabled: false,
    message: 'Welcome to Toiral Web - Swipe and tap to navigate',
    showOnlyOnFirstVisit: true,
    autoHideAfter: 5000 // milliseconds
  }
};
const ContentContext = createContext<ContentContextType | undefined>(undefined);
// Define constants for caching
const CACHE_PREFIX = 'toiral_data_';
const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes in milliseconds

// Initial loading state
const initialLoadingState: DataLoadingState = {
  isLoading: true,
  progress: {},
  lastUpdated: {},
  isRefreshing: false
};

export function ContentProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<ContentSettings>(defaultContent);
  const [loadingState, setLoadingState] = useState<DataLoadingState>(initialLoadingState);
  const { user } = useAuth();

  // Helper function to save data to localStorage with timestamp
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  }, []);

  // Helper function to get data from localStorage if not expired
  const getFromCache = useCallback((key: string) => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_EXPIRY) {
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Error reading cache for ${key}:`, error);
      return null;
    }
  }, []);

  // Function to preload essential data before showing content
  const preloadEssentialData = useCallback(async (): Promise<boolean> => {
    try {
      console.log('Preloading essential data...');
      setLoadingState(prev => ({ ...prev, isLoading: true }));

      // Import and run the initialization function
      const { initializeRequiredPaths } = await import('../firebase/initializeRequiredPaths');
      await initializeRequiredPaths();

      // Define critical paths that must be loaded before showing content
      const criticalPaths = [
        'company',
        'portfolio',
        'reviews',
        'contact',
        'services',
        'pricing',
        'theme',
        'community'
      ];

      // Try to load from cache first for immediate display
      criticalPaths.forEach(path => {
        const cachedData = getFromCache(path);
        if (cachedData) {
          setContent(prev => ({
            ...prev,
            [path]: cachedData
          }));
          console.log(`Loaded ${path} from cache`);
        }
      });

      // Fetch fresh data from Firebase (in parallel)
      await Promise.all(criticalPaths.map(async (path) => {
        try {
          const snapshot = await get(ref(database, path));
          if (snapshot.exists()) {
            const data = snapshot.val();

            // Update content with fresh data
            setContent(prev => ({
              ...prev,
              [path]: data
            }));

            // Save to cache
            saveToCache(path, data);

            // Update loading progress
            setLoadingState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                [path]: true
              },
              lastUpdated: {
                ...prev.lastUpdated,
                [path]: Date.now()
              }
            }));
          }
        } catch (error) {
          console.error(`Error preloading ${path}:`, error);
        }
      }));

      // Mark loading as complete
      setLoadingState(prev => ({
        ...prev,
        isLoading: false
      }));

      console.log('Essential data preloading complete');
      return true;
    } catch (error) {
      console.error('Error preloading essential data:', error);
      setLoadingState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [getFromCache, saveToCache]);

  // Function to refresh specific data or all data
  const refreshData = useCallback(async (path?: string) => {
    try {
      setLoadingState(prev => ({ ...prev, isRefreshing: true }));

      if (path) {
        // Refresh specific path
        const snapshot = await get(ref(database, path));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setContent(prev => ({
            ...prev,
            [path]: data
          }));
          saveToCache(path, data);
          setLoadingState(prev => ({
            ...prev,
            lastUpdated: {
              ...prev.lastUpdated,
              [path]: Date.now()
            }
          }));
        }
      } else {
        // Refresh all critical paths
        await preloadEssentialData();
      }

      // Mark refreshing as complete after a short delay to show the indicator
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isRefreshing: false }));
      }, 500);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLoadingState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [preloadEssentialData, saveToCache]);

  // Initialize required paths and subscribe to Firebase data
  useEffect(() => {
    const initializeAndSubscribe = async () => {
      try {
        // Import and run the initialization function
        const { initializeRequiredPaths } = await import('../firebase/initializeRequiredPaths');
        await initializeRequiredPaths();

        // Subscribe to all required paths
        const paths = [
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
          'pricing',
          'testimonialSettings',
          'analytics',
          'seo',
          'emailMarketing',
          'games',
          'mobileWelcome',
          'contactSubmissions',
          'contactInfo',
          'ads',
          'socialStats',
          'community'
        ];

        // Create a subscription for each path
        const unsubscribes = paths.map(path => {
          return onValue(ref(database, path), (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();

              // Update content with fresh data
              setContent(prev => ({
                ...prev,
                [path]: data
              }));

              // Save to cache
              saveToCache(path, data);

              // Update loading state
              setLoadingState(prev => ({
                ...prev,
                progress: {
                  ...prev.progress,
                  [path]: true
                },
                lastUpdated: {
                  ...prev.lastUpdated,
                  [path]: Date.now()
                }
              }));

              console.log(`Updated ${path} from Firebase`);
            }
          });
        });

        // Subscribe to bookings - for admin panel, we need all bookings
        // For regular users, we only show their own bookings
        const isAdminEmail = user?.email === "abirsabirhossain@gmail.com";
        const unsubscribeBookings = subscribeToBookings((bookings) => {
          setContent(prev => ({
            ...prev,
            bookings
          }));
          saveToCache('bookings', bookings);
        }, isAdminEmail ? undefined : user?.uid);

        // Subscribe to reviews
        const unsubscribeReviews = subscribeToReviews((reviews) => {
          setContent(prev => ({
            ...prev,
            reviews
          }));
          saveToCache('reviews', reviews);
        });

        // Subscribe to contact submissions
        const unsubscribeContactSubmissions = subscribeToContactSubmissions((contactSubmissions) => {
          setContent(prev => ({
            ...prev,
            contactSubmissions
          }));
          saveToCache('contactSubmissions', contactSubmissions);
        });

        // Subscribe to chat messages
        const unsubscribeChatMessages = subscribeToChatMessages((chatMessages) => {
          setContent(prev => ({
            ...prev,
            chatMessages
          }));
          saveToCache('chatMessages', chatMessages);
        });

        // Cleanup subscriptions on unmount
        return () => {
          unsubscribes.forEach(unsubscribe => unsubscribe());
          unsubscribeBookings();
          unsubscribeReviews();
          unsubscribeContactSubmissions();
          unsubscribeChatMessages();
        };
      } catch (error) {
        console.error('Error initializing Firebase paths:', error);
      }
    };

    initializeAndSubscribe();
  }, [user?.uid, saveToCache]);
  const emitContentUpdate = (type: string, data: any) => {
    window.dispatchEvent(new CustomEvent('contentUpdate', {
      detail: {
        type,
        data
      }
    }));
  };
  const updateContent = async (newContent: Partial<ContentSettings>) => {
    try {
      // Update local state first for immediate UI feedback
      setContent(prev => {
        const updated = {
          ...prev,
          ...newContent
        };
        emitContentUpdate('content', updated);
        return updated;
      });

      // Then update Firebase for each changed section
      const keys = Object.keys(newContent) as Array<keyof ContentSettings>;
      for (const key of keys) {
        if (newContent[key]) {
          // Write to the appropriate path in Firebase
          await set(ref(database, String(key)), newContent[key]);
          console.log(`Updated Firebase path: ${key}`);
        }
      }
    } catch (error) {
      console.error('Error updating content in Firebase:', error);
      alert('Failed to save changes to Firebase. Please try again.');
    }
  };
  const addTeamMember = async (member: TeamMember) => {
    try {
      // Update local state first for immediate UI feedback
      setContent(prev => {
        const updated = {
          ...prev,
          about: {
            ...prev.about,
            teamMembers: [...prev.about.teamMembers, member]
          }
        };
        emitContentUpdate('team', updated.about.teamMembers);
        return updated;
      });

      // Then update Firebase
      const snapshot = await get(ref(database, 'about'));
      const currentAbout = snapshot.exists() ? snapshot.val() : { teamMembers: [] };

      await set(ref(database, 'about'), {
        ...currentAbout,
        teamMembers: [...(currentAbout.teamMembers || []), member]
      });

      console.log('Updated team members in Firebase');
    } catch (error) {
      console.error('Error adding team member to Firebase:', error);
      alert('Failed to save team member to Firebase. Please try again.');
    }
  };
  const validateTeamMember = (member: TeamMember) => {
    if (!member.name || !member.role || !member.image) {
      throw new Error('Invalid team member data');
    }
  };
  const safeUpdate = async (action: () => Promise<void> | void) => {
    try {
      await action();
      return true;
    } catch (error) {
      console.error('Update failed:', error);
      return false;
    }
  };
  // Update notification status (read/unread)
  const updateNotificationStatus = async (id: string, read: boolean) => {
    try {
      // Update in Firebase
      await update(ref(database, `notifications/${id}`), { read });

      // Update local state
      setContent(prev => {
        if (!prev.notifications || typeof prev.notifications !== 'object') {
          return prev;
        }

        return {
          ...prev,
          notifications: {
            ...prev.notifications,
            [id]: {
              ...prev.notifications[id],
              read
            }
          }
        };
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error updating notification status:', error);
      return Promise.reject(error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // Clear in Firebase
      await set(ref(database, 'notifications'), {});

      // Update local state
      setContent(prev => ({
        ...prev,
        notifications: {}
      }));

      return Promise.resolve();
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return Promise.reject(error);
    }
  };

  return <ContentContext.Provider value={{
    content,
    updateContent: data => safeUpdate(() => updateContent(data)),
    addTeamMember: member => safeUpdate(() => {
      validateTeamMember(member);
      addTeamMember(member);
    }),
    removeTeamMember: async (id: string) => {
      try {
        // Update local state first for immediate UI feedback
        setContent(prev => ({
          ...prev,
          about: {
            ...prev.about,
            teamMembers: prev.about.teamMembers.filter(m => m.id !== id)
          }
        }));

        // Then update Firebase
        const snapshot = await get(ref(database, 'about'));
        if (snapshot.exists()) {
          const currentAbout = snapshot.val();
          await set(ref(database, 'about'), {
            ...currentAbout,
            teamMembers: (currentAbout.teamMembers || []).filter((m: any) => m.id !== id)
          });
          console.log('Removed team member from Firebase');
        }
      } catch (error) {
        console.error('Error removing team member from Firebase:', error);
        alert('Failed to remove team member from Firebase. Please try again.');
      }
    },
    addPortfolioItem: async (item: PortfolioItem) => {
      try {
        // Update local state first for immediate UI feedback
        setContent(prev => ({
          ...prev,
          portfolio: [...prev.portfolio, item]
        }));

        // Then update Firebase
        const snapshot = await get(ref(database, 'portfolio'));
        const currentPortfolio = snapshot.exists() ? snapshot.val() : [];

        await set(ref(database, 'portfolio'), [...currentPortfolio, item]);
        console.log('Added portfolio item to Firebase');
      } catch (error) {
        console.error('Error adding portfolio item to Firebase:', error);
        alert('Failed to add portfolio item to Firebase. Please try again.');
      }
    },
    removePortfolioItem: async (id: string) => {
      try {
        // Update local state first for immediate UI feedback
        setContent(prev => ({
          ...prev,
          portfolio: prev.portfolio.filter(p => p.id !== id)
        }));

        // Then update Firebase
        const snapshot = await get(ref(database, 'portfolio'));
        if (snapshot.exists()) {
          const currentPortfolio = snapshot.val();
          await set(ref(database, 'portfolio'), currentPortfolio.filter((p: any) => p.id !== id));
          console.log('Removed portfolio item from Firebase');
        }
      } catch (error) {
        console.error('Error removing portfolio item from Firebase:', error);
        alert('Failed to remove portfolio item from Firebase. Please try again.');
      }
    },
    updateReview: async (id: string, approved: boolean) => {
      try {
        await updateReviewApproval(id, approved);
        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error updating review:', error);
      }
    },
    removeReview: async (id: string) => {
      try {
        await deleteReview(id);
        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error removing review:', error);
      }
    },
    updateContactInfo: async (info: Partial<ContactInfo>) => {
      try {
        // Update local state first for immediate UI feedback
        setContent(prev => ({
          ...prev,
          contact: {
            ...prev.contact,
            ...info
          }
        }));

        // Then update Firebase
        const snapshot = await get(ref(database, 'contact'));
        const currentContact = snapshot.exists() ? snapshot.val() : {};

        await set(ref(database, 'contact'), {
          ...currentContact,
          ...info
        });

        console.log('Updated contact info in Firebase');
      } catch (error) {
        console.error('Error updating contact info in Firebase:', error);
        alert('Failed to update contact info in Firebase. Please try again.');
      }
    },
    updateServiceTypes: async (serviceTypes: ServiceType[]) => {
      try {
        // Update local state first for immediate UI feedback
        setContent(prev => ({
          ...prev,
          serviceTypes
        }));

        // Then update Firebase
        await set(ref(database, 'serviceTypes'), serviceTypes);
        console.log('Updated service types in Firebase');
      } catch (error) {
        console.error('Error updating service types in Firebase:', error);
        alert('Failed to update service types in Firebase. Please try again.');
      }
    },
    addBooking: async (bookingData: Omit<BookingSubmission, 'id' | 'status' | 'submittedAt'>) => {
      try {
        // Use the Firebase utility function to add the booking
        // Note: The userId is now added in the BookingForm component
        await addFirebaseBooking(bookingData);
        console.log('Added booking to Firebase');

        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error adding booking to Firebase:', error);
        alert('Failed to add booking to Firebase. Please try again.');
      }
    },
    updateBookingStatus: async (id: string, status: BookingSubmission['status']) => {
      try {
        await updateFirebaseBookingStatus(id, status);
        // Emit event for UI updates that need immediate notification
        emitContentUpdate('booking_update', { id, status });
        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error updating booking status:', error);
      }
    },
    removeBooking: async (id: string) => {
      try {
        // For now, we'll just update the status to 'rejected' instead of deleting
        await updateFirebaseBookingStatus(id, 'rejected');
        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error removing booking:', error);
      }
    },
    updateCompanyProfile: async (profile: Partial<CompanyProfile>) => {
      try {
        // Update local state first for immediate UI feedback
        setContent(prev => ({
          ...prev,
          company: {
            ...prev.company,
            ...profile
          }
        }));

        // Then update Firebase
        const snapshot = await get(ref(database, 'company'));
        const currentCompany = snapshot.exists() ? snapshot.val() : {};

        await set(ref(database, 'company'), {
          ...currentCompany,
          ...profile
        });

        console.log('Updated company profile in Firebase');
      } catch (error) {
        console.error('Error updating company profile in Firebase:', error);
        alert('Failed to update company profile in Firebase. Please try again.');
      }
    },
    updateContactSubmissionStatus: async (id: string, status: ContactFormSubmission['status']) => {
      try {
        await updateContactStatus(id, status);
        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error updating contact submission status:', error);
      }
    },
    removeContactSubmission: async (id: string) => {
      try {
        await deleteContactSubmission(id);
        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error removing contact submission:', error);
      }
    },
    addContactSubmission: async (submission: Omit<ContactFormSubmission, 'id' | 'status' | 'submittedAt'>) => {
      try {
        // Use the Firebase utility function to add the contact submission
        await addFirebaseContactSubmission(submission);
        console.log('Added contact submission to Firebase');

        // The UI will update automatically through the Firebase subscription
      } catch (error) {
        console.error('Error adding contact submission to Firebase:', error);
        alert('Failed to add contact submission to Firebase. Please try again.');
      }
    },
    updateNotificationStatus,
    clearAllNotifications,

    // New data loading methods and state
    loadingState,
    preloadEssentialData,
    refreshData
  }}>
      {children}
    </ContentContext.Provider>;
}
export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}