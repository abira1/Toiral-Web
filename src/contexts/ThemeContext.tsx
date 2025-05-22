import React, { useEffect, useState, createContext, useContext } from 'react';
import { database } from '../firebase/config';
import { ref, onValue, set } from 'firebase/database';

interface SectionConfig {
  id: string;
  label: string;
  icon: string;
  order: number;
  visible: boolean;
  startMenuOnly?: boolean;
}

interface ThemeSettings {
  backgroundColor: string;
  backgroundImage: string | null;
  useBackgroundImage: boolean;
  accentColor: string;
  clockVisible: boolean;
  clockTimezone: string;
  desktopIcons: {
    visible: boolean;
    position: 'left' | 'right';
    size: 'small' | 'medium' | 'large';
  };
  menuIcons: {
    size: 'small' | 'medium' | 'large';
  };
  chatbotName: string;
  dialogDefaultWidth: number;
  sections: SectionConfig[];
  themeMode: 'default';
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

export const defaultSettings: ThemeSettings = {
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
  sections: [
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
    /* Profile section removed as requested */
    {
      id: 'reviews',
      label: 'Reviews',
      icon: 'https://i.postimg.cc/cLf4vgkK/Review.png',
      order: 5,
      visible: true
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'https://i.postimg.cc/RCb0yzn0/Contact.png',
      order: 6,
      visible: true
    },
    {
      id: 'pricing',
      label: 'Pricing',
      icon: 'https://i.postimg.cc/Kz9zZLJV/dollar-sign.png',
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
    },
    {
      id: 'community',
      label: 'Community',
      icon: '/assets/images/community.png',
      order: 12,
      visible: true
    }
  ]
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Function to ensure required sections exist in sections
  const ensureRequiredSections = (sections: any[]) => {
    let updatedSections = [...sections];

    // Required sections with their default values
    const requiredSections = [
      {
        id: 'pricing',
        label: 'Pricing',
        icon: 'https://i.postimg.cc/Kz9zZLJV/dollar-sign.png',
        visible: true
      },
      {
        id: 'chat',
        label: 'Live Chat',
        icon: 'https://i.postimg.cc/7hbZhKjD/Chat.png',
        visible: true
      },
      {
        id: 'games',
        label: 'Games',
        icon: '/assets/images/games.png',
        visible: true,
        startMenuOnly: true
      },
      {
        id: 'reversi',
        label: 'Reversi',
        icon: '/assets/images/reversi.png',
        visible: true,
        startMenuOnly: true
      },
      {
        id: 'checkers',
        label: 'Checkers',
        icon: '/assets/images/checkers.png',
        visible: true,
        startMenuOnly: true
      },
      {
        id: 'community',
        label: 'Community',
        icon: '/assets/images/community.png',
        visible: true
      }
    ];

    // Check and add each required section if it doesn't exist
    requiredSections.forEach(requiredSection => {
      const sectionExists = updatedSections.some(section => section.id === requiredSection.id);

      if (!sectionExists) {
        updatedSections.push({
          ...requiredSection,
          order: updatedSections.length + 1
        });
      }
    });

    return updatedSections;
  };

  // Load theme settings from Firebase
  useEffect(() => {
    const themeRef = ref(database, 'theme');

    const unsubscribe = onValue(themeRef, (snapshot) => {
      setIsLoading(true);
      try {
        const data = snapshot.val();
        if (data) {
          // Ensure required sections exist
          const updatedSections = ensureRequiredSections(data.sections || []);

          setSettings({
            ...defaultSettings,
            ...data,
            sections: updatedSections,
            desktopIcons: {
              ...defaultSettings.desktopIcons,
              ...(data.desktopIcons || {})
            },
            menuIcons: {
              ...defaultSettings.menuIcons,
              ...(data.menuIcons || {})
            }
          });

          // If we added any required sections, update the database
          if (updatedSections.length !== (data.sections || []).length) {
            const updatedData = {
              ...data,
              sections: updatedSections
            };
            set(themeRef, updatedData)
              .then(() => {
                console.log('Updated theme settings with required sections');
              })
              .catch(error => {
                console.error('Error updating theme settings with required sections:', error);
              });
          }
        } else {
          // If no data exists in Firebase, initialize with default settings
          set(themeRef, defaultSettings)
            .then(() => {
              console.log('Default theme settings saved to Firebase');
            })
            .catch(error => {
              console.error('Error saving default theme settings to Firebase:', error);
              // Fallback to localStorage if Firebase fails
              const saved = localStorage.getItem('themeSettings');
              if (saved) {
                try {
                  const parsed = JSON.parse(saved);
                  const updatedSections = ensureRequiredSections(parsed.sections || []);

                  setSettings({
                    ...defaultSettings,
                    ...parsed,
                    sections: updatedSections,
                    desktopIcons: {
                      ...defaultSettings.desktopIcons,
                      ...(parsed.desktopIcons || {})
                    }
                  });
                } catch (e) {
                  console.error('Error parsing localStorage theme settings:', e);
                }
              }
            });
        }
      } catch (error) {
        console.error('Error loading theme settings from Firebase:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('themeSettings');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const updatedSections = ensureRequiredSections(parsed.sections || []);

            setSettings({
              ...defaultSettings,
              ...parsed,
              sections: updatedSections,
              desktopIcons: {
                ...defaultSettings.desktopIcons,
                ...(parsed.desktopIcons || {})
              }
            });
          } catch (e) {
            console.error('Error parsing localStorage theme settings:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save settings to both Firebase and localStorage for backup
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    // If sections are being updated, ensure required sections exist
    let sectionsToUse = newSettings.sections;
    if (sectionsToUse) {
      sectionsToUse = ensureRequiredSections(sectionsToUse);
    }

    const updatedSettings = {
      ...settings,
      ...newSettings,
      sections: sectionsToUse || settings.sections,
      desktopIcons: {
        ...settings.desktopIcons,
        ...(newSettings.desktopIcons || {})
      },
      menuIcons: {
        ...settings.menuIcons,
        ...(newSettings.menuIcons || {})
      }
    };

    setSettings(updatedSettings);

    // Save to Firebase
    const themeRef = ref(database, 'theme');
    set(themeRef, updatedSettings)
      .catch(error => {
        console.error('Error saving theme settings to Firebase:', error);
      });

    // Also save to localStorage as backup
    try {
      localStorage.setItem('themeSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving theme settings to localStorage:', error);
    }
  };

  const resetSettings = () => {
    // Ensure required sections exist in default settings
    const updatedDefaultSettings = {
      ...defaultSettings,
      sections: ensureRequiredSections(defaultSettings.sections)
    };

    setSettings(updatedDefaultSettings);

    // Reset in Firebase
    const themeRef = ref(database, 'theme');
    set(themeRef, updatedDefaultSettings)
      .catch(error => {
        console.error('Error resetting theme settings in Firebase:', error);
      });

    // Also reset in localStorage
    try {
      localStorage.setItem('themeSettings', JSON.stringify(updatedDefaultSettings));
    } catch (error) {
      console.error('Error resetting theme settings in localStorage:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isLoading
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}