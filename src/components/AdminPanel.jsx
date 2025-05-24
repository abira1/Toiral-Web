import React, { useEffect, useState, useRef } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon, PlusIcon, PhoneIcon, MailIcon, ClockIcon, CheckIcon, XIcon, StarIcon, SaveIcon, RotateCcwIcon, AlertTriangleIcon, BellIcon, RefreshCwIcon, DollarSignIcon, MonitorIcon, DatabaseIcon, TrendingUpIcon, SearchIcon, BarChartIcon, SmartphoneIcon, DownloadIcon, GamepadIcon, Share2Icon, UsersIcon, MessageSquareIcon } from 'lucide-react';
import { SecuritySettings } from './SecuritySettings';
import { AboutUsManagement } from './AboutUsManagement';
import { ThemeManagement } from './ThemeManagement';
import { NotificationManager } from './NotificationManager';
import { BookingConfirmationDialog } from './BookingConfirmationDialog';
import { ContactInfoManager } from './ContactInfoManager';
import { ServicesManager } from './ServicesManager';
import { AdManagerDashboard } from './admin/AdManager/AdManagerDashboard';
import { DatabaseInitializer } from './DatabaseInitializer';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { SEOManager } from './admin/SEOManager';
import { EmailMarketing } from './admin/EmailMarketing';
import { TestimonialManager } from './admin/TestimonialManager';
import { AppManager } from './admin/AppManager';
import { GameManager } from './admin/GameManager';
import { SocialProofManager } from './admin/SocialProofManager';
import { ForumManager } from './admin/ForumManager';

import { ref, set } from 'firebase/database';
import { database } from '../firebase/config';
import { sendAppointmentApprovalNotification } from '../firebase/notificationService';
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
  const [activeTab, setActiveTab] = useState('about');
  const [notificationsInitialized, setNotificationsInitialized] = useState(false);
  const { isAdminUser, isModeratorUser } = useAuth();

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
  } = useContent();

  const [saveStatus, setSaveStatus] = useState('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalContentRef = useRef(content);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const hasChanges = JSON.stringify(content) !== JSON.stringify(originalContentRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [content]);

  const handleCompanyUpdate = (field, value) => {
    // Ensure company exists before updating
    const currentCompany = content.company || {};

    updateContent({
      company: {
        ...currentCompany,
        [field]: value
      }
    });
  };

  const handleTeamMemberAdd = () => {
    const newMember = {
      id: Date.now().toString(),
      name: 'New Team Member',
      role: 'Role',
      image: 'https://via.placeholder.com/200'
    };

    // Check if content.about exists
    const currentAbout = content.about || {};

    // Check if content.about.teamMembers is an array
    const currentTeamMembers = Array.isArray(currentAbout.teamMembers) ? currentAbout.teamMembers : [];

    updateContent({
      about: {
        ...currentAbout,
        teamMembers: [...currentTeamMembers, newMember]
      }
    });
  };

  const handleTeamMemberRemove = (id) => {
    // Check if content.about exists
    if (!content.about) {
      console.error('About section is undefined');
      return;
    }

    // Check if content.about.teamMembers is an array
    if (!Array.isArray(content.about.teamMembers)) {
      console.error('Team members is not an array:', content.about.teamMembers);
      return;
    }

    updateContent({
      about: {
        ...content.about,
        teamMembers: content.about.teamMembers.filter(member => member.id !== id)
      }
    });
  };

  const handleTeamMemberUpdate = (id, field, value) => {
    // Check if content.about exists
    if (!content.about) {
      console.error('About section is undefined');
      return;
    }

    // Check if content.about.teamMembers is an array
    if (!Array.isArray(content.about.teamMembers)) {
      console.error('Team members is not an array:', content.about.teamMembers);
      return;
    }

    updateContent({
      about: {
        ...content.about,
        teamMembers: content.about.teamMembers.map(member => member.id === id ? {
          ...member,
          [field]: value
        } : member)
      }
    });
  };

  const handlePortfolioAdd = () => {
    const newItem = {
      id: Date.now().toString(),
      title: 'New Project',
      description: 'Project Description',
      image: 'https://via.placeholder.com/300',
      url: 'https://example.com'
    };

    // Check if content.portfolio is an array
    const currentPortfolio = Array.isArray(content.portfolio) ? content.portfolio : [];

    updateContent({
      portfolio: [...currentPortfolio, newItem]
    });
  };

  const handlePortfolioUpdate = (id, field, value) => {
    // Check if content.portfolio is an array
    if (!Array.isArray(content.portfolio)) {
      console.error('Portfolio is not an array:', content.portfolio);
      return;
    }

    updateContent({
      portfolio: content.portfolio.map(item => item.id === id ? {
        ...item,
        [field]: value
      } : item)
    });
  };

  const handlePortfolioRemove = (id) => {
    // Check if content.portfolio is an array
    if (!Array.isArray(content.portfolio)) {
      console.error('Portfolio is not an array:', content.portfolio);
      return;
    }

    updateContent({
      portfolio: content.portfolio.filter(item => item.id !== id)
    });
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      // Save each section to its specific path in Firebase
      const updates = {};

      // Helper function to check if a section has changed and add it to updates
      const checkAndAddUpdate = (key) => {
        const originalValue = getContentProperty(originalContentRef.current, String(key), undefined);
        const currentValue = getContentProperty(content, String(key), undefined);

        if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
          updates[key] = currentValue;
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

  const [notificationStatus, setNotificationStatus] = useState(null);

  /**
   * Helper function to update booking status with type safety
   * @param booking The booking to update
   * @param newStatus The new status (must be one of the allowed values)
   */
  const updateBookingStatus = async (booking, newStatus) => {
    // Update in Firebase
    await set(ref(database, `bookings/${booking.id}/status`), newStatus);

    // Create updated booking object
    const updatedBooking = {
      ...booking,
      status: newStatus
    };

    // Ensure bookings is an array before mapping
    const currentBookings = Array.isArray(content.bookings) ? content.bookings : [];

    // Update local state
    updateContent({
      bookings: currentBookings.map(b => b.id === booking.id ? updatedBooking : b)
    });

    return updatedBooking;
  };

  const handleBookingApprove = async (booking) => {
    try {
      console.log('Approving booking:', booking.id);

      // Use our helper function to update the booking status
      const approvedBooking = await updateBookingStatus(booking, 'approved');
      console.log('Updated booking status in Firebase');
      console.log('Updated local state');

      // Dispatch event for UI updates
      const event = new CustomEvent('contentUpdate', {
        detail: {
          type: 'booking_update',
          data: {
            id: approvedBooking.id,
            status: approvedBooking.status
          }
        }
      });

      window.dispatchEvent(event);
      console.log('Dispatched event');

      // Send notification to user
      setNotificationStatus({
        booking: booking.id,
        status: 'sending'
      });

      try {
        // Check if user has a userId (required for notifications)
        if (!booking.userId) {
          setNotificationStatus({
            booking: booking.id,
            status: 'error',
            message: 'No user ID associated with this booking'
          });
          console.log('No user ID associated with this booking');
        } else {
          // Send notification
          console.log('Attempting to send notification to user:', booking.userId);
          const notificationSent = await sendAppointmentApprovalNotification(approvedBooking);

          if (notificationSent) {
            setNotificationStatus({
              booking: booking.id,
              status: 'success',
              message: 'Notification sent successfully'
            });
            console.log('Notification sent successfully');
          } else {
            // This is a non-critical error - the appointment is still approved
            setNotificationStatus({
              booking: booking.id,
              status: 'error',
              message: 'User may not have notifications enabled'
            });
            console.log('User may not have notifications enabled');
          }
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        setNotificationStatus({
          booking: booking.id,
          status: 'error',
          message: 'Failed to send notification'
        });
      }

      // Show confirmation dialog
      setConfirmedBooking(approvedBooking);
      setShowBookingConfirmation(true);

      // Clear notification status after 5 seconds
      setTimeout(() => {
        setNotificationStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking. Please try again.');

      setNotificationStatus({
        booking: booking.id,
        status: 'error',
        message: 'Failed to approve booking'
      });
    }
  };

  return (
    <div className="p-4 relative">
      <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-400 pb-2">
        {[{
          id: 'about',
          label: 'Toiral'
        }, {
          id: 'portfolio',
          label: 'Portfolio'
        }, {
          id: 'testimonials',
          label: (
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 mr-1" />
              Testimonials
            </div>
          )
        }, {
          id: 'contact',
          label: 'Contact'
        }, {
          id: 'booking',
          label: 'Bookings'
        },
        // Only show security tab for admins
        ...(isAdminUser ? [{
          id: 'security',
          label: 'Security'
        }] : []), {
          id: 'about-us',
          label: 'Profile'
        }, {
          id: 'theme',
          label: 'Theme'
        }, {
          id: 'services',
          label: (
            <div className="flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-1" />
              Services
            </div>
          )
        }, {
          id: 'contact-info',
          label: (
            <div className="flex items-center">
              <PhoneIcon className="w-4 h-4 mr-1" />
              Contact Info
            </div>
          )
        }, {
          id: 'ads',
          label: (
            <div className="flex items-center">
              <MonitorIcon className="w-4 h-4 mr-1" />
              Ad Manager
            </div>
          )
        }, {
          id: 'analytics',
          label: (
            <div className="flex items-center">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              Analytics
            </div>
          )
        }, {
          id: 'seo',
          label: (
            <div className="flex items-center">
              <SearchIcon className="w-4 h-4 mr-1" />
              SEO Manager
            </div>
          )
        }, {
          id: 'email-marketing',
          label: (
            <div className="flex items-center">
              <MailIcon className="w-4 h-4 mr-1" />
              Email Marketing
            </div>
          )
        }, {
          id: 'notifications',
          label: (
            <div className="flex items-center">
              <BellIcon className="w-4 h-4 mr-1" />
              Notifications
              {content.notifications && typeof content.notifications === 'object' &&
                Object.values(content.notifications).filter(n => !n.read).length > 0 && (
                <span className="ml-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {Object.values(content.notifications).filter(n => !n.read).length}
                </span>
              )}
            </div>
          )
        }, {
          id: 'app-manager',
          label: (
            <div className="flex items-center">
              <SmartphoneIcon className="w-4 h-4 mr-1" />
              App Management
            </div>
          )
        }, {
          id: 'games',
          label: (
            <div className="flex items-center">
              <GamepadIcon className="w-4 h-4 mr-1" />
              Game Manager
            </div>
          )
        },
        // Only show database tools for admins
        ...(isAdminUser ? [{
          id: 'database-tools',
          label: (
            <div className="flex items-center">
              <DatabaseIcon className="w-4 h-4 mr-1" />
              Database Tools
            </div>
          )
        }] : []), {
          id: 'social-proof',
          label: (
            <div className="flex items-center">
              <Share2Icon className="w-4 h-4 mr-1" />
              Social Proof
            </div>
          )
        }, {
          id: 'community',
          label: (
            <div className="flex items-center">
              <MessageSquareIcon className="w-4 h-4 mr-1" />
              Community
            </div>
          )
        }].map(tab => (
          <Win95Button
            key={tab.id}
            className={`px-4 py-2 font-mono ${activeTab === tab.id ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Win95Button>
        ))}
      </div>

      <div className="space-y-6 pb-16">
        {activeTab === 'about' && (
          <section className="space-y-6 max-w-4xl mx-auto">
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
                      src={content.company?.headerImage || ''}
                      alt="Header Preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Header+Image';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members section would go here */}

            {/* Save/Reset buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-300 border-t-2 border-gray-400 p-4 flex justify-between items-center">
              <div className="flex items-center">
                {saveStatus === 'saving' && (
                  <div className="flex items-center text-blue-600">
                    <RefreshCwIcon className="w-5 h-5 animate-spin mr-2" />
                    <span className="font-mono">Saving changes...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center text-green-600">
                    <CheckIcon className="w-5 h-5 mr-2" />
                    <span className="font-mono">Changes saved successfully!</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangleIcon className="w-5 h-5 mr-2" />
                    <span className="font-mono">{saveError || 'Error saving changes'}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Win95Button
                  className="px-4 py-2 font-mono flex items-center"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                >
                  <RotateCcwIcon className="w-4 h-4 mr-2" />
                  Reset Changes
                </Win95Button>
                <Win95Button
                  className="px-4 py-2 font-mono flex items-center bg-blue-100"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </Win95Button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'portfolio' && (
          <section className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
              <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2">
                <h3 className="font-mono font-bold text-xl">
                  Portfolio Projects
                </h3>
                <Win95Button onClick={handlePortfolioAdd} className="px-4 py-2 font-mono">
                  <PlusIcon className="w-4 h-4 inline-block mr-2" />
                  Add Project
                </Win95Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(content.portfolio) && content.portfolio.length > 0 ? (
                  content.portfolio.map(project => (
                    <div key={project.id} className="bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Project+Image';
                          }}
                        />
                      </div>
                      <div className="p-4 space-y-2">
                        <input
                          type="text"
                          value={project.title}
                          onChange={e => handlePortfolioUpdate(project.id, 'title', e.target.value)}
                          className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                          placeholder="Project Title"
                        />
                        <textarea
                          value={project.description}
                          onChange={e => handlePortfolioUpdate(project.id, 'description', e.target.value)}
                          className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                          rows={3}
                          placeholder="Project Description"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="url"
                            value={project.image}
                            onChange={e => handlePortfolioUpdate(project.id, 'image', e.target.value)}
                            className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                            placeholder="Image URL"
                          />
                          <input
                            type="url"
                            value={project.url}
                            onChange={e => handlePortfolioUpdate(project.id, 'url', e.target.value)}
                            className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                            placeholder="Project URL"
                          />
                        </div>
                        <Win95Button
                          onClick={() => handlePortfolioRemove(project.id)}
                          className="w-full p-2 border-2 border-gray-600 text-red-600"
                        >
                          <TrashIcon className="w-4 h-4 inline-block mr-2" />
                          Remove Project
                        </Win95Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 bg-gray-50 border-2 border-gray-400">
                    <p className="font-mono text-gray-600 mb-4">No portfolio items yet. Add your first project!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'testimonials' && (
          <section className="space-y-6">
            <TestimonialManager />
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="space-y-6">
            <h3 className="font-mono font-bold text-lg">
              Contact Form Submissions
            </h3>
            <div className="space-y-4">
              {content.contactSubmissions && Array.isArray(content.contactSubmissions) && content.contactSubmissions.length > 0 ? (
                content.contactSubmissions.map(submission => (
                  <div key={submission.id} className="p-4 bg-white border-2 border-gray-400">
                    <div className="flex justify-between mb-2">
                      <span className="font-mono font-bold">
                        {submission.name}
                      </span>
                      <span className="font-mono text-sm">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-mono text-sm text-gray-600">
                        {submission.email} - {submission.subject}
                      </span>
                    </div>
                    <p className="font-mono text-sm mb-4 whitespace-pre-line">
                      {submission.message}
                    </p>
                    <div className="flex gap-2">
                      <Win95Button onClick={() => window.location.href = `mailto:${submission.email}`} className="flex-1 p-2 font-mono">
                        <MailIcon className="w-4 h-4 inline-block mr-2" />
                        Reply
                      </Win95Button>
                      <Win95Button
                        onClick={async () => {
                          try {
                            await set(ref(database, `contactSubmissions/${submission.id}`), null);

                            // Ensure contactSubmissions is an array before filtering
                            const currentSubmissions = Array.isArray(content.contactSubmissions)
                              ? content.contactSubmissions
                              : [];

                            updateContent({
                              contactSubmissions: currentSubmissions.filter(s => s.id !== submission.id)
                            });
                          } catch (error) {
                            console.error('Error removing contact submission:', error);
                            alert('Failed to remove contact submission. Please try again.');
                          }
                        }}
                        className="flex-1 p-2 font-mono text-red-600"
                      >
                        <TrashIcon className="w-4 h-4 inline-block mr-2" />
                        Remove
                      </Win95Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-white border-2 border-gray-400 text-center">
                  <MailIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-mono text-gray-600">No contact submissions available</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'booking' && (
          <section className="space-y-6">
            <h3 className="font-mono font-bold text-lg">Booking Management</h3>
            <div className="space-y-4">
              {content.bookings && Array.isArray(content.bookings) && content.bookings.length > 0 ? (
                content.bookings.map(booking => (
                  <div key={booking.id} className="p-4 bg-white border-2 border-gray-400">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-mono font-bold">
                          {booking.firstName} {booking.lastName}
                        </span>
                        {booking.status && (
                          <span className={`ml-2 px-2 py-0.5 text-xs font-mono rounded ${
                            booking.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status === 'approved'
                              ? 'Approved'
                              : booking.status === 'rejected'
                                ? 'Rejected'
                                : 'Pending'}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-sm">
                        {new Date(booking.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="font-mono text-sm">
                          <MailIcon className="w-4 h-4 inline-block mr-2" />
                          {booking.email}
                        </p>
                        <p className="font-mono text-sm">
                          <PhoneIcon className="w-4 h-4 inline-block mr-2" />
                          {booking.phone}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-sm">
                          <ClockIcon className="w-4 h-4 inline-block mr-2" />
                          {booking.date} at {booking.time}
                        </p>
                        <p className="font-mono text-sm font-bold">
                          {booking.serviceType}
                        </p>
                      </div>
                    </div>
                    <p className="font-mono text-sm mb-4 whitespace-pre-line">
                      {booking.description}
                    </p>
                    <div className="flex gap-2">
                      <Win95Button
                        onClick={() => handleBookingApprove(booking)}
                        className={`flex-1 p-2 font-mono ${booking.status === 'approved' ? 'bg-green-100' : ''}`}
                        disabled={booking.status === 'approved'}
                      >
                        <CheckIcon className="w-4 h-4 inline-block mr-2" />
                        Approve
                      </Win95Button>
                      <Win95Button
                        onClick={async () => {
                          try {
                            // Use our helper function to update the booking status
                            await updateBookingStatus(booking, 'rejected');
                          } catch (error) {
                            console.error('Error rejecting booking:', error);
                            alert('Failed to reject booking. Please try again.');
                          }
                        }}
                        className={`flex-1 p-2 border-2 border-gray-600 ${booking.status === 'rejected' ? 'bg-red-100' : ''}`}
                        disabled={booking.status === 'rejected'}
                      >
                        <XIcon className="w-4 h-4 inline-block mr-2" />
                        Reject
                      </Win95Button>
                      <Win95Button
                        onClick={async () => {
                          try {
                            await set(ref(database, `bookings/${booking.id}`), null);
                            updateContent({
                              bookings: content.bookings.filter(b => b.id !== booking.id)
                            });
                          } catch (error) {
                            console.error('Error removing booking:', error);
                            alert('Failed to remove booking. Please try again.');
                          }
                        }}
                        className="flex-1 p-2 border-2 border-gray-600 text-red-600"
                      >
                        <TrashIcon className="w-4 h-4 inline-block mr-2" />
                        Remove
                      </Win95Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-white border-2 border-gray-400 text-center">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-mono text-gray-600">No bookings available</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'security' && (
          <SecuritySettings />
        )}

        {activeTab === 'about-us' && (
          <AboutUsManagement />
        )}

        {activeTab === 'theme' && (
          <ThemeManagement />
        )}

        {activeTab === 'services' && (
          <ServicesManager />
        )}

        {activeTab === 'contact-info' && (
          <ContactInfoManager />
        )}

        {activeTab === 'ads' && (
          <AdManagerDashboard />
        )}

        {activeTab === 'analytics' && (
          <section className="space-y-6">
            <AnalyticsDashboard />
          </section>
        )}

        {activeTab === 'seo' && (
          <section className="space-y-6">
            <SEOManager />
          </section>
        )}

        {activeTab === 'email-marketing' && (
          <section className="space-y-6">
            <EmailMarketing />
          </section>
        )}

        {activeTab === 'notifications' && (
          <NotificationManager />
        )}

        {activeTab === 'app-manager' && (
          <AppManager />
        )}

        {activeTab === 'games' && (
          <GameManager />
        )}

        {activeTab === 'database-tools' && (
          <section className="space-y-6">
            <h3 className="font-mono font-bold text-lg">Database Tools</h3>
            <DatabaseInitializer />
          </section>
        )}

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

      </div>

      {showBookingConfirmation && confirmedBooking && (
        <BookingConfirmationDialog
          booking={confirmedBooking}
          onClose={() => setShowBookingConfirmation(false)}
        />
      )}

      {resetConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-300 border-2 border-gray-400 shadow-lg p-4 max-w-md w-full">
            <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4 flex justify-between items-center">
              <span>Confirm Reset</span>
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="font-mono mb-4">
                Are you sure you want to reset all changes? This will revert all unsaved changes.
              </p>
              <div className="flex justify-end gap-2">
                <Win95Button
                  onClick={() => setResetConfirmOpen(false)}
                  className="px-4 py-2 font-mono"
                >
                  Cancel
                </Win95Button>
                <Win95Button
                  onClick={confirmReset}
                  className="px-4 py-2 font-mono bg-red-100"
                >
                  Reset Changes
                </Win95Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
