import { useEffect, useState, useRef } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { TrashIcon, PlusIcon, PhoneIcon, MailIcon, CheckIcon, StarIcon, SaveIcon, RotateCcwIcon, AlertTriangleIcon, BellIcon, RefreshCwIcon, DollarSignIcon, MonitorIcon, TrendingUpIcon, SearchIcon, Share2Icon, MessageSquareIcon, SmartphoneIcon } from 'lucide-react';
import { SecuritySettings } from './SecuritySettings';
import { AboutUsManagement } from './AboutUsManagement';
import { ThemeManagement } from './ThemeManagement';
import { NotificationManager } from './NotificationManager';
import { BookingConfirmationDialog } from './BookingConfirmationDialog';
import { ContactInfoManager } from './ContactInfoManager';
import { ServicesManager } from './ServicesManager';
import { AdManagerDashboard } from './admin/AdManager/AdManagerDashboard';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { SEOManager } from './admin/SEOManager';
import { EmailMarketing } from './admin/EmailMarketing';
import { TestimonialManager } from './admin/TestimonialManager';
import { EnhancedTeamMembersManager } from './admin/EnhancedTeamMembersManager';
import { ConsoleTeamMembersHelper } from './ConsoleTeamMembersHelper';
import { GameManager } from './admin/GameManager';
import { SocialProofManager } from './admin/SocialProofManager';
import { ForumManager } from './admin/ForumManager';
import { MobileWelcomeManager } from './admin/MobileWelcomeManager';
import { ContactSubmissionsManager } from './admin/ContactSubmissionsManager';
import { BookingManager } from './admin/BookingManager';
import { NewPortfolioManager } from './admin/NewPortfolioManager';
import { EmergencyPortfolioManager } from './admin/EmergencyPortfolioManager';
import { DraggablePortfolioManager } from './admin/DraggablePortfolioManager';


import {
  BookingSubmission,
  ContentSettings,
  CompanyProfile,
} from '../types';
import { ref, set } from 'firebase/database';
import { database } from '../firebase/config';
// Notification service import removed (unused)

import { getContentProperty } from '../utils/contentUtils';

// Define placeholder functions if they don't exist
const initializeNotificationsPath = async () => {
  console.log('Initializing notifications path');
  return true;
};

const fixNotificationsPath = async () => {
  console.log('Fixing notifications path');
  return true;
};
export function AdminPanel() {
  // Set the default active tab to 'about' (Toiral section)
  const [activeTab, setActiveTab] = useState('about');

  // Force the active tab to be 'about' (Toiral section) on initial load
  useEffect(() => {
    setActiveTab('about');
    console.log('Forcing active tab to Toiral section');
  }, []);

  // Debug log for initial tab
  console.log('Initial active tab:', activeTab);
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);

  // Initialize notifications path when component mounts
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // First, fix any issues with the notifications path
        await fixNotificationsPath();

        // Then initialize it if needed
        await initializeNotificationsPath();

        setNotificationsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initNotifications();
  }, []);



  const {
    content,
    updateContent,
  } = useContent() as {
    content: ContentSettings;
    updateContent: (updates: Partial<ContentSettings>) => void;
  };
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalContentRef = useRef<ContentSettings>(content);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSubmission | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => {
    const hasChanges = JSON.stringify(content) !== JSON.stringify(originalContentRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [content]);
  const handleCompanyUpdate = (field: keyof CompanyProfile, value: string) => {
    // Ensure company exists before updating
    const currentCompany = content.company || {} as CompanyProfile;

    updateContent({
      company: {
        ...currentCompany,
        [field]: value
      }
    });
  };
  // Team member functions moved to TeamMembersManager component
  // Portfolio functions moved to PortfolioManager component

  // Define a type for content section keys
  type ContentSectionKey = keyof ContentSettings;

  // Define a type for the updates object
  type ContentUpdates = {
    [K in ContentSectionKey]?: ContentSettings[K];
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      // Save each section to its specific path in Firebase
      const updates: ContentUpdates = {};

      // Helper function to check if a section has changed and add it to updates
      const checkAndAddUpdate = <K extends ContentSectionKey>(key: K) => {
        const originalValue = getContentProperty(originalContentRef.current, String(key), undefined);
        const currentValue = getContentProperty(content, String(key), undefined);

        if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
          updates[key] = currentValue as ContentSettings[K];
        }
      };

      // Check each section for changes
      checkAndAddUpdate('toiral');
      checkAndAddUpdate('portfolio');
      checkAndAddUpdate('reviews');
      checkAndAddUpdate('contact');
      checkAndAddUpdate('bookings');
      checkAndAddUpdate('security');
      checkAndAddUpdate('profile');
      checkAndAddUpdate('theme');
      checkAndAddUpdate('company');
      checkAndAddUpdate('about');
      checkAndAddUpdate('services');
      checkAndAddUpdate('availableHours');
      checkAndAddUpdate('aboutUs');
      checkAndAddUpdate('contactInfo');
      checkAndAddUpdate('pricing');
      checkAndAddUpdate('testimonialSettings');
      checkAndAddUpdate('analytics');
      checkAndAddUpdate('seo');
      checkAndAddUpdate('emailMarketing');
      checkAndAddUpdate('games');
      checkAndAddUpdate('socialStats');
      checkAndAddUpdate('community');
      // Remove chatMessages from updates as we've removed the Messages section
      if (updates.chatMessages) {
        delete updates.chatMessages;
      }

      // Save each changed section to Firebase
      for (const [path, data] of Object.entries(updates)) {
        console.log(`Saving ${path} to Firebase...`);
        await set(ref(database, path), data);
      }

      originalContentRef.current = JSON.parse(JSON.stringify(content)); // Deep copy
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes to Firebase');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveError(null);
      }, 3000);
    }
  };
  const handleReset = () => {
    setResetConfirmOpen(true);
  };
  const confirmReset = () => {
    updateContent(originalContentRef.current);
    setHasUnsavedChanges(false);
    setResetConfirmOpen(false);
  };
  // Notification status state removed (unused)

  // Booking status update function moved to AppointmentManager component

  // Booking approval function moved to AppointmentManager component
  // Debug log to see the entire content structure
  console.log('Full content structure:', content);
  console.log('Active tab:', activeTab);

  // Additional debug logging for team members
  useEffect(() => {
    console.log('AdminPanel: About content:', content.about);
    console.log('AdminPanel: Team members:', content.about?.teamMembers);
    console.log('AdminPanel: Active tab:', activeTab);
  }, [content.about, activeTab]);

  return <div className="p-4 relative">
      {/* Console Helper for Team Members Management */}
      <ConsoleTeamMembersHelper />




      {/* Main tabs - First row */}
      <div className="flex flex-wrap gap-1 mb-1">
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'about' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          Toiral
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'portfolio' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'testimonials' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('testimonials')}
        >
          <StarIcon className="w-4 h-4 inline-block mr-1" />
          Testimonials
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'contact' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          Contact
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'booking' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('booking')}
        >
          Bookings
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'security' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'about-us' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('about-us')}
        >
          Profile
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'theme' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('theme')}
        >
          Theme
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'services' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <DollarSignIcon className="w-4 h-4 inline-block mr-1" />
          Services
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'contact-info' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('contact-info')}
        >
          <PhoneIcon className="w-4 h-4 inline-block mr-1" />
          Contact Info
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'ads' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('ads')}
        >
          <MonitorIcon className="w-4 h-4 inline-block mr-1" />
          Ad Manager
        </Win95Button>
      </div>

      {/* Second row of tabs */}
      <div className="flex flex-wrap gap-1 mb-1">
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'analytics' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUpIcon className="w-4 h-4 inline-block mr-1" />
          Analytics
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'seo' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          <SearchIcon className="w-4 h-4 inline-block mr-1" />
          SEO Manager
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'email-marketing' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('email-marketing')}
        >
          <MailIcon className="w-4 h-4 inline-block mr-1" />
          Email Marketing
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'notifications' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <BellIcon className="w-4 h-4 inline-block mr-1" />
          Notifications
          {content.notifications && typeof content.notifications === 'object' &&
            Object.values(content.notifications).filter(n => !n.read).length > 0 && (
            <span className="ml-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {Object.values(content.notifications).filter(n => !n.read).length}
            </span>
          )}
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'app-management' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('app-management')}
        >
          <SmartphoneIcon className="w-4 h-4 inline-block mr-1" />
          App Management
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'games' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('games')}
        >
          <MonitorIcon className="w-4 h-4 inline-block mr-1" />
          Game Manager
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'social-proof' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('social-proof')}
        >
          <Share2Icon className="w-4 h-4 inline-block mr-1" />
          Social Proof
        </Win95Button>
      </div>

      {/* Third row of tabs */}
      <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-400 pb-2">
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'database-tools' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('database-tools')}
        >
          Database Tools
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'community' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <MessageSquareIcon className="w-4 h-4 inline-block mr-1" />
          Community
        </Win95Button>
      </div>
      <div className="space-y-6 pb-16">
        {activeTab === 'about' && (
          <section className="space-y-6 max-w-4xl mx-auto">


            {/* Company Profile Section */}
            <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
              <h3 className="font-mono font-bold text-xl border-b-2 border-gray-200 pb-2">
                Company Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-mono text-gray-600">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={content.company?.name || ''}
                      onChange={e => handleCompanyUpdate('name', e.target.value)}
                      className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-mono text-gray-600">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={content.company?.tagline || ''}
                      onChange={e => handleCompanyUpdate('tagline', e.target.value)}
                      className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-mono text-gray-600">
                      Header Image URL
                    </label>
                    <input
                      type="url"
                      value={content.company?.headerImage || ''}
                      onChange={e => handleCompanyUpdate('headerImage', e.target.value)}
                      className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    />
                  </div>
                  <div className="aspect-video relative border-2 border-gray-400 overflow-hidden rounded-lg">
                    <img
                      src={content.company?.headerImage || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22400%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22800%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EHeader%20Image%3C%2Ftext%3E%3C%2Fsvg%3E'}
                      alt="Header Preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22400%22%20viewBox%3D%220%200%20800%20400%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22800%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EHeader%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TEAM MEMBERS SECTION */}
            <div className="mb-6">
              <EnhancedTeamMembersManager />
            </div>
          </section>
        )}
        {activeTab === 'portfolio' && <section className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white p-4 border border-gray-300 rounded-lg mb-6 shadow-md">
              <h3 className="text-xl font-bold mb-2">Portfolio Manager</h3>
              <p className="text-gray-600">Manage your portfolio projects with drag-and-drop reordering</p>
            </div>
            <DraggablePortfolioManager />
          </section>}



        {activeTab === 'testimonials' && <section className="space-y-6">
            <TestimonialManager />
          </section>}
        {activeTab === 'contact' && <section className="space-y-6">
            <ContactSubmissionsManager />
          </section>}
        {activeTab === 'booking' && <section className="space-y-6">
            <BookingManager />
          </section>}
        {activeTab === 'security' && <section className="space-y-6">
            <SecuritySettings />
          </section>}
        {activeTab === 'about-us' && <section className="space-y-6">
            <AboutUsManagement />
          </section>}
        {activeTab === 'theme' && <section className="space-y-6">
            <ThemeManagement />
          </section>}
        {activeTab === 'contact-info' && <section className="space-y-6">
            <ContactInfoManager />
          </section>}
        {activeTab === 'services' && <section className="space-y-6">
            <ServicesManager />
          </section>}
        {activeTab === 'ads' && <section className="space-y-6">
            <AdManagerDashboard />
          </section>}
        {activeTab === 'analytics' && <section className="space-y-6">
            <AnalyticsDashboard />
          </section>}

        {activeTab === 'seo' && <section className="space-y-6">
            <SEOManager />
          </section>}

        {activeTab === 'email-marketing' && <section className="space-y-6">
            <EmailMarketing />
          </section>}

        {activeTab === 'games' && <section className="space-y-6">
            <GameManager />
          </section>}

        {activeTab === 'notifications' && <section className="space-y-6">
            {notificationsInitialized && content.notifications && typeof content.notifications === 'object' ? (
              <NotificationManager />
            ) : (
              <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BellIcon className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                    <p className="font-mono text-gray-700">Notifications system is initializing...</p>
                    <Win95Button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 font-mono text-sm mt-4"
                    >
                      <RefreshCwIcon className="w-4 h-4 inline-block mr-1" />
                      Refresh
                    </Win95Button>
                  </div>
                </div>
              </div>
            )}
          </section>}

        {activeTab === 'app-management' && <section className="space-y-6">
            <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
              <h3 className="font-mono font-bold text-xl mb-4">App Management</h3>
              <p className="mb-4">Manage mobile app settings and configurations.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-300 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">App Settings</h4>
                  <p className="text-sm text-gray-600 mb-4">Configure app behavior and appearance</p>
                  <Win95Button className="px-4 py-2 font-mono">
                    <SmartphoneIcon className="w-4 h-4 inline-block mr-2" />
                    Manage Settings
                  </Win95Button>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Push Notifications</h4>
                  <p className="text-sm text-gray-600 mb-4">Send and schedule push notifications</p>
                  <Win95Button className="px-4 py-2 font-mono">
                    <BellIcon className="w-4 h-4 inline-block mr-2" />
                    Manage Notifications
                  </Win95Button>
                </div>
              </div>
            </div>
          </section>}

        {activeTab === 'social-proof' && (
          <section className="space-y-6">
            <SocialProofManager />
          </section>
        )}

        {activeTab === 'community' && (
          <section className="space-y-6">
            <ForumManager />
          </section>
        )}

        {activeTab === 'mobile-welcome' && (
          <section className="space-y-6">
            <MobileWelcomeManager />
          </section>
        )}

        {activeTab === 'database-tools' && (
          <section className="space-y-6">
            <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
              <h3 className="font-mono font-bold text-xl mb-4">Database Tools</h3>
              <p className="mb-4">Manage and maintain your database.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-300 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Backup Database</h4>
                  <p className="text-sm text-gray-600 mb-4">Create a backup of your current database</p>
                  <Win95Button className="px-4 py-2 font-mono">
                    Create Backup
                  </Win95Button>
                </div>
                <div className="border border-gray-300 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">Database Cleanup</h4>
                  <p className="text-sm text-gray-600 mb-4">Remove unused data and optimize storage</p>
                  <Win95Button className="px-4 py-2 font-mono">
                    Run Cleanup
                  </Win95Button>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-300 border-t-2 border-white p-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Win95Button onClick={handleSave} className={`px-4 py-2 font-mono flex items-center gap-2 transition-all duration-200
              ${hasUnsavedChanges ? 'bg-blue-100 hover:bg-blue-200' : 'opacity-50 cursor-not-allowed'}
              ${saveStatus === 'saving' ? 'animate-pulse' : ''}
            `} disabled={!hasUnsavedChanges || saveStatus === 'saving'}>
            <SaveIcon className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? <span className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-1" />
                Saved!
              </span> : saveStatus === 'error' ? <span className="flex items-center text-red-600">
                <AlertTriangleIcon className="w-4 h-4 mr-1" />
                Save Failed
              </span> : 'Save Changes'}
          </Win95Button>
          <Win95Button onClick={handleReset} className={`px-4 py-2 font-mono flex items-center gap-2 text-red-600 transition-all duration-200
              ${hasUnsavedChanges ? 'hover:bg-red-100' : 'opacity-50 cursor-not-allowed'}
            `} disabled={!hasUnsavedChanges}>
            <RotateCcwIcon className="w-4 h-4" />
            Reset Changes
          </Win95Button>
        </div>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && <span className="font-mono text-sm text-gray-600 animate-pulse">
              You have unsaved changes
            </span>}
          {saveError && <div className="font-mono text-sm text-red-600 flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4" />
              {saveError}
            </div>}
        </div>
      </div>
      {resetConfirmOpen && <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60]">
          <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4 max-w-md w-full mx-4 shadow-lg">
            <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4">
              Confirm Reset
            </div>
            <div className="p-4 bg-white border-2 border-gray-600 border-t-gray-800 border-l-gray-800">
              <div className="mb-6">
                <h3 className="font-mono font-bold mb-2">Reset all changes?</h3>
                <p className="font-mono text-sm text-gray-600">
                  This will revert all changes back to the last saved state.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Win95Button onClick={() => setResetConfirmOpen(false)} className="px-4 py-2 font-mono">
                  Cancel
                </Win95Button>
                <Win95Button onClick={confirmReset} className="px-4 py-2 font-mono bg-red-100 hover:bg-red-200 text-red-600">
                  Reset Changes
                </Win95Button>
              </div>
            </div>
          </div>
        </div>}
      {showBookingConfirmation && confirmedBooking && (
        <BookingConfirmationDialog
          booking={confirmedBooking}
          notificationStatus={null} /* Notification status handling moved to AppointmentManager */
          onClose={() => {
            setShowBookingConfirmation(false);
            setConfirmedBooking(null);
          }}
        />
      )}
    </div>;
}