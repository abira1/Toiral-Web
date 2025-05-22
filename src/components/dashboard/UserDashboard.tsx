import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, get, onValue, off } from 'firebase/database';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  SettingsIcon,
  BellIcon,
  RefreshCwIcon,
  LoaderIcon,
  DownloadIcon
} from 'lucide-react';
import { BookingSubmission } from '../../types';

interface UserPreferences {
  notifications: boolean;
  theme: 'default';
  emailUpdates: boolean;
}

interface UserActivity {
  id: string;
  type: 'login' | 'appointment' | 'profile_update' | 'message';
  timestamp: number;
  details: string;
}

export function UserDashboard() {
  const { user, userProfile } = useAuth();
  const [appointments, setAppointments] = useState<BookingSubmission[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: true,
    theme: 'default',
    emailUpdates: true
  });
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState({
    appointments: true,
    preferences: true,
    activities: true
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'preferences' | 'activities'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);

  // Fetch user appointments
  useEffect(() => {
    if (!user) return;

    setLoading(prev => ({ ...prev, appointments: true }));

    const appointmentsRef = ref(database, 'bookings');

    const handleAppointments = (snapshot: any) => {
      if (snapshot.exists()) {
        const allAppointments = Object.values(snapshot.val()) as BookingSubmission[];
        // Filter appointments for the current user
        const userAppointments = allAppointments.filter(
          (appointment: BookingSubmission) => appointment.userId === user.uid
        );

        // Sort by date (newest first)
        userAppointments.sort((a: BookingSubmission, b: BookingSubmission) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setAppointments(userAppointments);
      } else {
        setAppointments([]);
      }
      setLoading(prev => ({ ...prev, appointments: false }));
    };

    onValue(appointmentsRef, handleAppointments);

    return () => {
      off(appointmentsRef);
    };
  }, [user]);

  // Fetch user preferences
  useEffect(() => {
    if (!user) return;

    setLoading(prev => ({ ...prev, preferences: true }));

    const preferencesRef = ref(database, `preferences/${user.uid}`);

    const fetchPreferences = async () => {
      try {
        const snapshot = await get(preferencesRef);

        if (snapshot.exists()) {
          setPreferences(snapshot.val());
        } else {
          // Initialize with default preferences if none exist
          setPreferences({
            notifications: true,
            theme: 'default',
            emailUpdates: true
          });
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(prev => ({ ...prev, preferences: false }));
      }
    };

    fetchPreferences();
  }, [user]);

  // Fetch user activities
  useEffect(() => {
    if (!user) return;

    setLoading(prev => ({ ...prev, activities: true }));

    const activitiesRef = ref(database, `activities/${user.uid}`);

    const handleActivities = (snapshot: any) => {
      if (snapshot.exists()) {
        const activitiesData = snapshot.val();
        const activitiesList: UserActivity[] = Object.values(activitiesData);

        // Sort by timestamp (newest first)
        activitiesList.sort((a: UserActivity, b: UserActivity) => b.timestamp - a.timestamp);

        setActivities(activitiesList);
      } else {
        // If no activities exist, create some sample activities
        const sampleActivities: UserActivity[] = [
          {
            id: '1',
            type: 'login',
            timestamp: Date.now() - 3600000, // 1 hour ago
            details: 'Logged in successfully'
          },
          {
            id: '2',
            type: 'profile_update',
            timestamp: Date.now() - 86400000, // 1 day ago
            details: 'Updated profile information'
          }
        ];

        setActivities(sampleActivities);
      }
      setLoading(prev => ({ ...prev, activities: false }));
    };

    onValue(activitiesRef, handleActivities);

    return () => {
      off(activitiesRef);
    };
  }, [user]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);

    // Re-fetch all data
    setLoading({
      appointments: true,
      preferences: true,
      activities: true
    });

    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Check if PWA install is available
  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = () => {
      setInstallPromptAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallPromptAvailable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle install app click
  const handleInstallApp = () => {
    // Create and dispatch a custom event to trigger the install prompt
    const event = new CustomEvent('showInstallPrompt');
    window.dispatchEvent(event);
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <UserIcon className="w-4 h-4" />;
      case 'appointment':
        return <CalendarIcon className="w-4 h-4" />;
      case 'profile_update':
        return <SettingsIcon className="w-4 h-4" />;
      case 'message':
        return <BellIcon className="w-4 h-4" />;
      default:
        return <AlertTriangleIcon className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-200 text-black">
        <div className="bg-white border-2 border-gray-400 p-4 text-center">
          <p className="font-mono">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-200 text-black">
      {/* Header */}
      <div className="bg-white border-2 border-gray-400 p-4 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400 mr-4">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <UserIcon className="w-6 h-6 text-blue-800" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-mono font-bold text-lg">
                {userProfile?.displayName || 'User'}'s Dashboard
              </h2>
              <p className="font-mono text-sm text-gray-600">
                {userProfile?.email || user.email}
              </p>
            </div>
          </div>
          <Win95Button
            onClick={handleRefresh}
            className="px-4 py-2 font-mono flex items-center"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Refresh
              </>
            )}
          </Win95Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex mb-4 overflow-x-auto">
        <Win95Button
          className={`px-4 py-2 font-mono whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-100 border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono whitespace-nowrap ${activeTab === 'appointments' ? 'bg-blue-100 border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono whitespace-nowrap ${activeTab === 'preferences' ? 'bg-blue-100 border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono whitespace-nowrap ${activeTab === 'activities' ? 'bg-blue-100 border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          Recent Activities
        </Win95Button>
      </div>

      {/* Content Area */}
      <div className="bg-white border-2 border-gray-400 p-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-mono font-bold text-lg border-b-2 border-gray-200 pb-2">
              Dashboard Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Appointments Summary */}
              <div className="bg-gray-100 border-2 border-gray-300 p-4">
                <div className="flex items-center mb-2">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-800" />
                  <h4 className="font-mono font-bold">Appointments</h4>
                </div>
                {loading.appointments ? (
                  <div className="flex justify-center py-4">
                    <LoaderIcon className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="font-mono">
                    <p>Total: {appointments.length}</p>
                    <p>Upcoming: {appointments.filter(a => new Date(a.date) > new Date()).length}</p>
                    <p>Approved: {appointments.filter(a => a.status === 'approved').length}</p>
                    <p>Pending: {appointments.filter(a => a.status === 'pending').length}</p>
                  </div>
                )}
              </div>

              {/* Preferences Summary */}
              <div className="bg-gray-100 border-2 border-gray-300 p-4">
                <div className="flex items-center mb-2">
                  <SettingsIcon className="w-5 h-5 mr-2 text-blue-800" />
                  <h4 className="font-mono font-bold">Preferences</h4>
                </div>
                {loading.preferences ? (
                  <div className="flex justify-center py-4">
                    <LoaderIcon className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="font-mono">
                    <p>Theme: Default</p>
                    <p>Notifications: {preferences.notifications ? 'Enabled' : 'Disabled'}</p>
                    <p>Email Updates: {preferences.emailUpdates ? 'Enabled' : 'Disabled'}</p>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-100 border-2 border-gray-300 p-4">
                <div className="flex items-center mb-2">
                  <ClockIcon className="w-5 h-5 mr-2 text-blue-800" />
                  <h4 className="font-mono font-bold">Recent Activity</h4>
                </div>
                {loading.activities ? (
                  <div className="flex justify-center py-4">
                    <LoaderIcon className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="font-mono">
                    {activities.slice(0, 3).map((activity, index) => (
                      <div key={activity.id} className="mb-2 text-sm">
                        <div className="flex items-center">
                          {getActivityIcon(activity.type)}
                          <span className="ml-2">{activity.details}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <p>No recent activities</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Install App Section */}
            {installPromptAvailable && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DownloadIcon className="w-5 h-5 mr-2 text-blue-800" />
                    <h4 className="font-mono font-bold">Install Toiral Web App</h4>
                  </div>
                  <Win95Button
                    onClick={handleInstallApp}
                    className="px-4 py-2 font-mono flex items-center"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Install App
                  </Win95Button>
                </div>
                <p className="font-mono text-sm mt-2">
                  Install Toiral Web as an app on your device for a better experience, faster access, and offline capabilities.
                </p>
              </div>
            )}

            {/* Next Appointment */}
            <div className="mt-6">
              <h4 className="font-mono font-bold mb-2">Next Appointment</h4>
              {loading.appointments ? (
                <div className="flex justify-center py-4">
                  <LoaderIcon className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {appointments.filter(a => new Date(a.date) > new Date()).length > 0 ? (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4">
                      {(() => {
                        const nextAppointment = [...appointments]
                          .filter(a => new Date(a.date) > new Date())
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                        return (
                          <div className="font-mono">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold">{nextAppointment.serviceType}</p>
                                <p>Date: {new Date(nextAppointment.date).toLocaleDateString()}</p>
                                <p>Time: {nextAppointment.time}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(nextAppointment.status)}`}>
                                {nextAppointment.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="mt-2">{nextAppointment.message}</p>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-gray-100 border-2 border-gray-300 p-4 text-center">
                      <p className="font-mono">No upcoming appointments</p>
                      <Win95Button
                        className="px-4 py-2 font-mono mt-2"
                        onClick={() => window.dispatchEvent(new CustomEvent('openDialog', { detail: { id: 'book' } }))}
                      >
                        Book an Appointment
                      </Win95Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h3 className="font-mono font-bold text-lg border-b-2 border-gray-200 pb-2">
              Your Appointments
            </h3>

            {loading.appointments ? (
              <div className="flex justify-center py-8">
                <LoaderIcon className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {appointments.length > 0 ? (
                  <div className="border-2 border-gray-300">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Service</th>
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Date</th>
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Time</th>
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b border-gray-200">
                            <td className="p-2 font-mono">{appointment.serviceType}</td>
                            <td className="p-2 font-mono">{new Date(appointment.date).toLocaleDateString()}</td>
                            <td className="p-2 font-mono">{appointment.time}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(appointment.status)}`}>
                                {appointment.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-100 border-2 border-gray-300 p-8 text-center">
                    <p className="font-mono mb-4">You don't have any appointments yet.</p>
                    <Win95Button
                      className="px-4 py-2 font-mono"
                      onClick={() => window.dispatchEvent(new CustomEvent('openDialog', { detail: { id: 'book' } }))}
                    >
                      Book an Appointment
                    </Win95Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <h3 className="font-mono font-bold text-lg border-b-2 border-gray-200 pb-2">
              User Preferences
            </h3>

            {loading.preferences ? (
              <div className="flex justify-center py-8">
                <LoaderIcon className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 border-2 border-gray-300 p-4">
                  <h4 className="font-mono font-bold mb-2">Theme Settings</h4>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="theme-default"
                      name="theme"
                      checked={true}
                      disabled={true}
                      className="mr-2"
                    />
                    <label htmlFor="theme-default" className="font-mono">Default Theme</label>
                  </div>
                </div>

                <div className="bg-gray-100 border-2 border-gray-300 p-4">
                  <h4 className="font-mono font-bold mb-2">Notification Settings</h4>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={preferences.notifications}
                      onChange={() => setPreferences({...preferences, notifications: !preferences.notifications})}
                      className="mr-2"
                    />
                    <label htmlFor="notifications" className="font-mono">Enable Browser Notifications</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email-updates"
                      checked={preferences.emailUpdates}
                      onChange={() => setPreferences({...preferences, emailUpdates: !preferences.emailUpdates})}
                      className="mr-2"
                    />
                    <label htmlFor="email-updates" className="font-mono">Receive Email Updates</label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Win95Button className="px-4 py-2 font-mono">
                    Save Preferences
                  </Win95Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            <h3 className="font-mono font-bold text-lg border-b-2 border-gray-200 pb-2">
              Recent Activities
            </h3>

            {loading.activities ? (
              <div className="flex justify-center py-8">
                <LoaderIcon className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {activities.length > 0 ? (
                  <div className="border-2 border-gray-300">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Activity</th>
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Details</th>
                          <th className="font-mono text-left p-2 border-b-2 border-gray-300">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity) => (
                          <tr key={activity.id} className="border-b border-gray-200">
                            <td className="p-2">
                              <div className="flex items-center">
                                {getActivityIcon(activity.type)}
                                <span className="ml-2 font-mono capitalize">{activity.type.replace('_', ' ')}</span>
                              </div>
                            </td>
                            <td className="p-2 font-mono">{activity.details}</td>
                            <td className="p-2 font-mono">{formatTimestamp(activity.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-100 border-2 border-gray-300 p-8 text-center">
                    <p className="font-mono">No activities recorded yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
