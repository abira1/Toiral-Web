import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Win95Button } from './Win95Button';
import { UserIcon, PhoneIcon, LogOutIcon, SaveIcon, CheckIcon, BellIcon, BellOffIcon, LayoutDashboardIcon } from 'lucide-react';
import { requestNotificationPermission } from '../firebase/fcmInit';
import { AppointmentManager } from './AppointmentManager';
import { UserDashboard } from './dashboard/UserDashboard';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, userProfile, signOutUser, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'appointments'>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'default' | 'not-supported'>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission as 'granted' | 'denied' | 'default');
    } else {
      setNotificationPermission('not-supported');
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onClose();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setError("Notifications are not supported in this browser");
      return;
    }

    setIsRequestingPermission(true);

    try {
      // In development, just simulate the permission request
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating notification permission request');
        setTimeout(() => {
          setNotificationPermission('granted');
          setIsRequestingPermission(false);
        }, 1000);
        return;
      }

      // In production, actually request permission
      const token = await requestNotificationPermission();

      if (token) {
        setNotificationPermission('granted');
      } else {
        // Check the current permission state
        setNotificationPermission(Notification.permission as 'granted' | 'denied' | 'default');
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setError("Failed to enable notifications. Please try again.");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log("Saving profile with:", { displayName, phoneNumber });
      await updateUserProfile(displayName, phoneNumber);

      // Update local state to reflect changes
      setIsEditing(false);
      setSaveSuccess(true);

      // Show success message for 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4 max-w-4xl mx-auto">
      {/* Removed duplicate title header */}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="md:w-64 space-y-4">
          <div className="bg-white border-2 border-gray-400 p-4 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full overflow-hidden mb-3 border-2 border-gray-400 shadow-md">
              {userProfile?.photoURL || user?.photoURL ? (
                <img
                  src={userProfile?.photoURL || user?.photoURL || ''}
                  alt={(userProfile?.displayName || user?.displayName || 'User')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Safer approach to handle image error
                    e.currentTarget.style.display = 'none';

                    // Create a fallback element
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = "w-full h-full flex items-center justify-center bg-blue-100";
                    fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-blue-800"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

                    // Safely append the fallback
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.appendChild(fallbackDiv);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <UserIcon className="w-10 h-10 text-blue-800" />
                </div>
              )}
            </div>
            <h3 className="font-mono font-bold text-lg mb-1">
              {userProfile?.displayName || user?.displayName || 'User'}
            </h3>
            <p className="font-mono text-sm text-gray-600 mb-1">
              {userProfile?.email || user?.email || 'No email'}
            </p>
            {user?.providerData && user.providerData.length > 0 && (
              <div className="flex justify-center mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.providerData[0].providerId === 'google.com' ? (
                    <>
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </>
                  ) : user.providerData[0].providerId}
                </span>
              </div>
            )}
            <Win95Button
              onClick={handleSignOut}
              className="w-full py-1 flex items-center justify-center gap-2"
            >
              <LogOutIcon className="w-4 h-4" />
              <span className="font-mono text-sm">Sign Out</span>
            </Win95Button>
          </div>

          <div className="bg-white border-2 border-gray-400">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 font-mono flex items-center ${
                activeTab === 'dashboard' ? 'bg-blue-100' : ''
              }`}
            >
              <LayoutDashboardIcon className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2 font-mono flex items-center ${
                activeTab === 'profile' ? 'bg-blue-100' : ''
              }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full text-left px-4 py-2 font-mono flex items-center ${
                activeTab === 'appointments' ? 'bg-blue-100' : ''
              }`}
            >
              <PhoneIcon className="w-4 h-4 mr-2" />
              My Appointments
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {activeTab === 'dashboard' ? (
            <UserDashboard />
          ) : activeTab === 'profile' ? (
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="font-mono font-bold text-lg mb-4 pb-2 border-b border-gray-300">
                Profile Information
              </h2>

              {error && (
                <div className="bg-red-100 border-2 border-red-400 p-3 mb-4">
                  <p className="font-mono text-sm text-red-700">{error}</p>
                </div>
              )}

              {saveSuccess && (
                <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 flex items-center">
                  <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  <p className="font-mono text-sm text-green-700">Profile updated successfully!</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Google Account Info Section */}
                {user?.providerData && user.providerData.length > 0 && user.providerData[0].providerId === 'google.com' && (
                  <div className="mb-6 bg-blue-50 border-2 border-blue-200 p-3 rounded">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <h4 className="font-mono font-bold">Google Account</h4>
                    </div>
                    <p className="font-mono text-xs text-gray-600 mb-2">
                      Your profile is connected to your Google account. Some information is automatically synced from Google.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="text-gray-600">Account ID:</div>
                      <div className="font-bold truncate">{user.uid.substring(0, 8)}...</div>
                      <div className="text-gray-600">Email Verified:</div>
                      <div className="font-bold">{user.emailVerified ? 'Yes' : 'No'}</div>
                      <div className="text-gray-600">Last Sign In:</div>
                      <div className="font-bold">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Unknown'}</div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-mono text-sm">Name:</label>
                  {isEditing ? (
                    <div className="flex">
                      <div className="bg-white p-2 border-2 border-gray-600 border-r-0 border-t-gray-800 border-l-gray-800">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                        placeholder="Your name"
                      />
                    </div>
                  ) : (
                    <div className="p-2 font-mono bg-gray-100 border border-gray-300">
                      {userProfile?.displayName || user?.displayName || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-mono text-sm">Email:</label>
                  <div className="p-2 font-mono bg-gray-100 border border-gray-300 flex items-center">
                    <span className="flex-grow">{userProfile?.email || user?.email || 'Not set'}</span>
                    {user?.emailVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-mono text-sm">Phone Number:</label>
                  {isEditing ? (
                    <div className="flex">
                      <div className="bg-white p-2 border-2 border-gray-600 border-r-0 border-t-gray-800 border-l-gray-800">
                        <PhoneIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                        placeholder="Your phone number"
                      />
                    </div>
                  ) : (
                    <div className="p-2 font-mono bg-gray-100 border border-gray-300">
                      {userProfile?.phoneNumber || 'Not set'}
                    </div>
                  )}
                </div>

                {/* Notification Settings */}
                <div className="mt-6 border-t border-gray-300 pt-4">
                  <h3 className="font-mono font-bold mb-3">Notification Settings</h3>

                  <div className="bg-gray-100 border border-gray-300 p-4 rounded">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-mono font-bold">Appointment Notifications</div>
                        <p className="font-mono text-xs text-gray-600">
                          Receive notifications when your appointments are approved or updated
                        </p>
                      </div>

                      <Win95Button
                        onClick={handleRequestNotificationPermission}
                        disabled={notificationPermission === 'granted' || isRequestingPermission || notificationPermission === 'not-supported'}
                        className="px-3 py-1 font-mono text-sm"
                      >
                        {isRequestingPermission ? (
                          'Requesting...'
                        ) : notificationPermission === 'granted' ? (
                          <span className="flex items-center">
                            <BellIcon className="w-4 h-4 mr-1 text-green-600" />
                            Enabled
                          </span>
                        ) : notificationPermission === 'denied' ? (
                          <span className="flex items-center">
                            <BellOffIcon className="w-4 h-4 mr-1 text-red-600" />
                            Blocked
                          </span>
                        ) : notificationPermission === 'not-supported' ? (
                          <span className="flex items-center">
                            <BellOffIcon className="w-4 h-4 mr-1 text-gray-600" />
                            Not Supported
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <BellIcon className="w-4 h-4 mr-1" />
                            Enable
                          </span>
                        )}
                      </Win95Button>
                    </div>

                    {notificationPermission === 'denied' && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 text-xs font-mono text-yellow-800">
                        <p className="font-bold mb-1">Notifications are blocked</p>
                        <p className="mb-2">To enable notifications, you need to update your browser settings:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Click the lock/info icon in your browser's address bar</li>
                          <li>Find "Notifications" in the site settings</li>
                          <li>Change the setting from "Block" to "Allow"</li>
                          <li>Refresh this page and click "Enable" again</li>
                        </ol>
                      </div>
                    )}

                    {notificationPermission === 'granted' && (
                      <div className="bg-green-50 border border-green-200 p-3 text-xs font-mono text-green-800">
                        <p className="font-bold mb-1">Notifications enabled!</p>
                        <p>You will receive notifications when:</p>
                        <ul className="list-disc pl-4 mt-1">
                          <li>Your appointment requests are approved</li>
                          <li>There are updates to your scheduled appointments</li>
                          <li>You receive important messages from our team</li>
                        </ul>
                      </div>
                    )}

                    {notificationPermission === 'default' && !isRequestingPermission && (
                      <div className="bg-blue-50 border border-blue-200 p-3 text-xs font-mono text-blue-800">
                        <p className="font-bold mb-1">Why enable notifications?</p>
                        <p>Enabling notifications allows you to:</p>
                        <ul className="list-disc pl-4 mt-1 mb-2">
                          <li>Get instant updates when your appointments are approved</li>
                          <li>Receive reminders about upcoming appointments</li>
                          <li>Stay informed about any schedule changes</li>
                        </ul>
                        <p>Click the "Enable" button above to get started.</p>
                      </div>
                    )}

                    {notificationPermission === 'not-supported' && (
                      <div className="bg-gray-50 border border-gray-200 p-3 text-xs font-mono text-gray-800">
                        <p className="font-bold mb-1">Notifications not supported</p>
                        <p>Your browser does not support notifications. To receive notifications:</p>
                        <ul className="list-disc pl-4 mt-1">
                          <li>Try using a modern browser like Chrome, Firefox, or Edge</li>
                          <li>Make sure you're not in private/incognito mode</li>
                          <li>Check that your device supports web notifications</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  {isEditing ? (
                    <>
                      <Win95Button
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(userProfile?.displayName || '');
                          setPhoneNumber(userProfile?.phoneNumber || '');
                          setError(null);
                        }}
                        className="px-4 py-2 font-mono mr-2"
                      >
                        Cancel
                      </Win95Button>
                      <Win95Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-4 py-2 font-mono bg-blue-100"
                      >
                        <SaveIcon className="w-4 h-4 mr-1 inline-block" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Win95Button>
                    </>
                  ) : (
                    <Win95Button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 font-mono"
                    >
                      Edit Profile
                    </Win95Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-400 p-4">
              <h2 className="font-mono font-bold text-lg mb-4 pb-2 border-b border-gray-300">
                My Appointments
              </h2>
              <AppointmentManager />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
