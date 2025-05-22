import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, get, set } from 'firebase/database';
import { useAuth } from './AuthContext';

// Define tour step interface
export interface TourStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  spotlightClicks?: boolean; // Allow clicks through the spotlight
  disableOverlay?: boolean; // Disable the overlay
  disableButtons?: boolean; // Disable the next/prev buttons
}

// Define tour interface
export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

interface TourContextType {
  activeTour: Tour | null;
  currentStepIndex: number;
  isTourActive: boolean;
  startTour: (tourId: string) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  hasSeenTour: (tourId: string) => boolean;
  markTourAsSeen: (tourId: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

// Available tours
const tours: Tour[] = [
  {
    id: 'desktop-tour',
    name: 'Desktop Tour',
    steps: [
      {
        id: 'welcome',
        target: 'body',
        title: 'Welcome to Toiral!',
        content: 'This quick tour will show you how to navigate our Windows 95-inspired interface. Click "Next" to continue.',
        position: 'bottom',
        disableOverlay: true
      },
      {
        id: 'start-menu',
        target: '.h-12 .h-10:first-child', // Target the Start button
        title: 'Start Menu',
        content: 'Click the Start button to access all available applications and features.',
        position: 'top',
        spotlightClicks: true
      },
      {
        id: 'desktop-icons',
        target: '.absolute.top-0.left-0.right-0',
        title: 'Desktop Icons',
        content: 'Click these icons to quickly access different sections of our website.',
        position: 'right',
        spotlightClicks: true
      },
      {
        id: 'taskbar-shortcuts',
        target: '.ml-1.md\\:ml-2.flex.space-x-1',
        title: 'Taskbar Shortcuts',
        content: 'These shortcuts provide quick access to our chat support and appointment booking.',
        position: 'top',
        spotlightClicks: true
      },
      {
        id: 'keyboard-shortcuts',
        target: 'body',
        title: 'Keyboard Shortcuts',
        content: 'Press Alt+K at any time to see available keyboard shortcuts.',
        position: 'bottom',
        disableOverlay: true
      }
    ]
  },
  {
    id: 'admin-tour',
    name: 'Admin Panel Tour',
    steps: [
      {
        id: 'admin-welcome',
        target: 'body',
        title: 'Welcome to the Admin Panel',
        content: 'This tour will guide you through the main features of the admin panel.',
        position: 'bottom',
        disableOverlay: true
      },
      {
        id: 'admin-navigation',
        target: '.admin-nav', // This selector should be added to the admin navigation
        title: 'Admin Navigation',
        content: 'Use these tabs to navigate between different admin sections.',
        position: 'right',
        spotlightClicks: true
      },
      {
        id: 'admin-content',
        target: '.admin-content', // This selector should be added to the admin content area
        title: 'Content Management',
        content: 'Here you can manage all the content displayed on your website.',
        position: 'top',
        spotlightClicks: true
      }
    ]
  }
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  const [seenTours, setSeenTours] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  // Load seen tours from all storage locations when user changes
  useEffect(() => {
    const loadSeenTours = async () => {
      // Start with an empty object to collect all seen tours
      let combinedSeenTours: Record<string, boolean> = {};

      // Check for direct localStorage entries first (most reliable)
      tours.forEach(tour => {
        if (localStorage.getItem(`toiral_seen_${tour.id}`) === 'true') {
          combinedSeenTours[tour.id] = true;
        }
      });

      // For logged-in users, also check Firebase
      if (user) {
        try {
          const toursRef = ref(database, `users/${user.uid}/seenTours`);
          const snapshot = await get(toursRef);
          if (snapshot.exists()) {
            // Merge with what we already have from localStorage
            combinedSeenTours = { ...combinedSeenTours, ...snapshot.val() };
          }
        } catch (error) {
          console.error('Error loading seen tours from Firebase:', error);
        }
      } else {
        // For non-logged in users, also check the legacy localStorage format
        const savedTours = localStorage.getItem('seenTours');
        if (savedTours) {
          try {
            const parsedTours = JSON.parse(savedTours);
            // Merge with what we already have
            combinedSeenTours = { ...combinedSeenTours, ...parsedTours };
          } catch (e) {
            console.error('Error parsing saved tours:', e);
          }
        }
      }

      // Update state with the combined results
      setSeenTours(combinedSeenTours);
    };

    loadSeenTours();
  }, [user]);

  // Check if user has seen a specific tour
  const hasSeenTour = (tourId: string): boolean => {
    // First check localStorage for a direct record
    if (localStorage.getItem(`toiral_seen_${tourId}`) === 'true') {
      return true;
    }
    // Then check our state object
    return !!seenTours[tourId];
  };

  // Mark a tour as seen
  const markTourAsSeen = async (tourId: string) => {
    const updatedSeenTours = { ...seenTours, [tourId]: true };
    setSeenTours(updatedSeenTours);

    // Always save to localStorage with a specific key for more permanent storage
    localStorage.setItem(`toiral_seen_${tourId}`, 'true');

    if (user) {
      // Save to Firebase for logged in users
      try {
        const toursRef = ref(database, `users/${user.uid}/seenTours`);
        await set(toursRef, updatedSeenTours);
      } catch (error) {
        console.error('Error saving seen tours:', error);
      }
    } else {
      // Save to localStorage for non-logged in users (as a backup)
      localStorage.setItem('seenTours', JSON.stringify(updatedSeenTours));
    }
  };

  // Start a tour
  const startTour = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId);
    if (tour) {
      setActiveTour(tour);
      setCurrentStepIndex(0);
      setIsTourActive(true);
    }
  };

  // End the current tour
  const endTour = () => {
    if (activeTour) {
      // Mark as seen in all storage locations
      markTourAsSeen(activeTour.id);

      // Also set in sessionStorage to prevent showing on refresh
      sessionStorage.setItem('toiral_tour_shown_this_session', 'true');

      // Directly set in localStorage for immediate effect
      localStorage.setItem(`toiral_seen_${activeTour.id}`, 'true');
    }

    setActiveTour(null);
    setCurrentStepIndex(0);
    setIsTourActive(false);
  };

  // Go to the next step
  const nextStep = () => {
    if (!activeTour) return;

    if (currentStepIndex < activeTour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      endTour();
    }
  };

  // Go to the previous step
  const prevStep = () => {
    if (!activeTour) return;

    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Go to a specific step
  const goToStep = (index: number) => {
    if (!activeTour) return;

    if (index >= 0 && index < activeTour.steps.length) {
      setCurrentStepIndex(index);
    }
  };

  // Check if it's the first visit and start the tour automatically - only once per browser
  useEffect(() => {
    // Create a specific key for this session to prevent showing on refresh
    const SESSION_KEY = 'toiral_tour_shown_this_session';

    const checkFirstVisit = async () => {
      // Check if we've already shown the tour in this browser session
      if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        return; // Don't show if already shown in this session
      }

      // Check if user has EVER seen the tour (permanent storage)
      const hasSeenTourPermanently = localStorage.getItem('toiral_seen_desktop_tour') === 'true';

      if (hasSeenTourPermanently) {
        // If they've seen it before, update our state to reflect this
        if (!seenTours['desktop-tour']) {
          const updatedSeenTours = { ...seenTours, 'desktop-tour': true };
          setSeenTours(updatedSeenTours);

          // Also update Firebase if user is logged in
          if (user) {
            try {
              const toursRef = ref(database, `users/${user.uid}/seenTours`);
              await set(toursRef, updatedSeenTours);
            } catch (error) {
              console.error('Error updating seen tours in Firebase:', error);
            }
          }
        }
        return; // Don't show the tour
      }

      // Only show if:
      // 1. We're on the homepage
      // 2. User has never seen the tour
      // 3. Tour hasn't been shown in this session yet
      if (!hasSeenTourPermanently && window.location.pathname === '/') {
        // Mark as shown in this session immediately to prevent showing on refresh
        sessionStorage.setItem(SESSION_KEY, 'true');

        // Wait a bit to ensure the UI is fully loaded
        setTimeout(() => {
          startTour('desktop-tour');
        }, 2000);
      }
    };

    checkFirstVisit();
  }, [seenTours, user]);

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStepIndex,
        isTourActive,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        hasSeenTour,
        markTourAsSeen
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
