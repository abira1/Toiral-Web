import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, onValue, set, get } from 'firebase/database';
import {
  DownloadIcon,
  SmartphoneIcon,
  PaletteIcon,
  ImageIcon,
  MessageSquareIcon,
  BarChartIcon,
  SaveIcon,
  RefreshCwIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { LazyImage } from '../LazyImage';

// Define types for PWA settings
interface PWAInstallPrompt {
  title: string;
  message: string;
  buttonText: string;
  enabled: boolean;
}

interface PWAIcons {
  favicon: string;
  appIcon192: string;
  appIcon512: string;
  maskableIcon: string;
}

interface PWAStats {
  installCount: number;
  installAttempts: number;
  lastInstalled: string | null;
}

interface PWASettings {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  installPrompt: PWAInstallPrompt;
  icons: PWAIcons;
  stats: PWAStats;
}

export function AppManager() {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'install' | 'stats'>('general');
  const [pwaSettings, setPwaSettings] = useState<PWASettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewInstallPrompt, setPreviewInstallPrompt] = useState(false);

  // Default PWA settings
  const defaultSettings: PWASettings = {
    appName: 'Toiral Web',
    shortName: 'Toiral',
    description: 'Toiral Web Development - Creating Tomorrow\'s Web, Today',
    themeColor: '#008080',
    backgroundColor: '#008080',
    displayMode: 'standalone',
    orientation: 'any',
    installPrompt: {
      title: 'Install Toiral Web',
      message: 'Install Toiral Web as an app on your device for a better experience.',
      buttonText: 'Install App',
      enabled: true
    },
    icons: {
      favicon: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
      appIcon192: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
      appIcon512: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
      maskableIcon: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png'
    },
    stats: {
      installCount: 0,
      installAttempts: 0,
      lastInstalled: null
    }
  };

  // Initialize with default settings
  useEffect(() => {
    // Set default settings initially to prevent undefined errors
    setPwaSettings(defaultSettings);

    // Then fetch from Firebase
    const pwaSettingsRef = ref(database, 'pwaSettings');

    const unsubscribe = onValue(pwaSettingsRef, (snapshot) => {
      setLoading(true);
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Ensure all required properties exist by merging with defaults
        const mergedSettings: PWASettings = {
          ...defaultSettings,
          ...data,
          // Ensure nested objects are properly merged
          installPrompt: {
            ...defaultSettings.installPrompt,
            ...(data.installPrompt || {})
          },
          icons: {
            ...defaultSettings.icons,
            ...(data.icons || {})
          },
          stats: {
            ...defaultSettings.stats,
            ...(data.stats || {})
          }
        };

        setPwaSettings(mergedSettings);
      } else {
        // Initialize with default values if not exists
        setPwaSettings(defaultSettings);
        // Save default settings to Firebase
        set(pwaSettingsRef, defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching PWA settings:', error);
      setError('Failed to load PWA settings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save PWA settings to Firebase
  const handleSave = async () => {
    if (!pwaSettings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await set(ref(database, 'pwaSettings'), pwaSettings);

      // Update manifest.json
      await updateManifestFile();

      setSuccess('PWA settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving PWA settings:', error);
      setError('Failed to save PWA settings');
    } finally {
      setSaving(false);
    }
  };

  // Update manifest.json file
  const updateManifestFile = async () => {
    if (!pwaSettings) return;

    // In a real implementation, you would update the manifest.json file
    // Since we can't directly modify files on the server in this implementation,
    // we'll just log what would be updated
    console.log('Updating manifest.json with:', {
      name: pwaSettings.appName,
      short_name: pwaSettings.shortName,
      description: pwaSettings.description,
      theme_color: pwaSettings.themeColor,
      background_color: pwaSettings.backgroundColor,
      display: pwaSettings.displayMode,
      orientation: pwaSettings.orientation,
      icons: [
        {
          src: pwaSettings.icons.appIcon192,
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: pwaSettings.icons.appIcon512,
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: pwaSettings.icons.maskableIcon,
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    });

    return true;
  };

  // Reset installation stats
  const handleResetStats = async () => {
    if (!pwaSettings) return;

    if (!window.confirm('Are you sure you want to reset all installation statistics?')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedSettings = {
        ...pwaSettings,
        stats: {
          installCount: 0,
          installAttempts: 0,
          lastInstalled: null
        }
      };

      await set(ref(database, 'pwaSettings'), updatedSettings);
      setPwaSettings(updatedSettings);
      setSuccess('Installation statistics reset successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error resetting stats:', error);
      setError('Failed to reset installation statistics');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (section: keyof PWASettings, field: string, value: any) => {
    if (!pwaSettings) return;

    if (section === 'installPrompt') {
      setPwaSettings({
        ...pwaSettings,
        installPrompt: {
          ...pwaSettings.installPrompt,
          [field]: value
        }
      });
    } else if (section === 'icons') {
      setPwaSettings({
        ...pwaSettings,
        icons: {
          ...pwaSettings.icons,
          [field]: value
        }
      });
    } else {
      setPwaSettings({
        ...pwaSettings,
        [field]: value
      });
    }
  };

  // Show install prompt preview
  const handleShowPreview = () => {
    setPreviewInstallPrompt(true);
    setTimeout(() => setPreviewInstallPrompt(false), 5000);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
        <div className="flex justify-center items-center h-64">
          <RefreshCwIcon className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 font-mono">Loading PWA settings...</span>
        </div>
      </div>
    );
  }

  if (!pwaSettings) {
    return (
      <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangleIcon className="w-6 h-6 mr-2" />
          <span className="font-mono">Failed to load PWA settings</span>
        </div>
        <Win95Button
          onClick={() => window.location.reload()}
          className="px-4 py-2 font-mono"
        >
          Reload Page
        </Win95Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
        <SmartphoneIcon className="w-5 h-5 mr-2" />
        App Management
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
          <AlertTriangleIcon className="w-5 h-5 inline-block mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-3 mb-4 rounded">
          <SaveIcon className="w-5 h-5 inline-block mr-2" />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-300">
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'general' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <div className="flex items-center">
            <SmartphoneIcon className="w-4 h-4 mr-1" />
            General
          </div>
        </Win95Button>

        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'appearance' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <div className="flex items-center">
            <PaletteIcon className="w-4 h-4 mr-1" />
            Appearance
          </div>
        </Win95Button>

        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'install' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('install')}
        >
          <div className="flex items-center">
            <MessageSquareIcon className="w-4 h-4 mr-1" />
            Install Prompt
          </div>
        </Win95Button>

        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'stats' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <div className="flex items-center">
            <BarChartIcon className="w-4 h-4 mr-1" />
            Statistics
          </div>
        </Win95Button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <h3 className="font-mono font-bold text-md border-b border-gray-200 pb-2">
            General App Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                App Name
              </label>
              <input
                type="text"
                value={pwaSettings.appName}
                onChange={(e) => handleInputChange('', 'appName', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
                placeholder="App Name"
              />
              <p className="text-xs text-gray-500 mt-1">
                The full name of your application
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Short Name
              </label>
              <input
                type="text"
                value={pwaSettings.shortName}
                onChange={(e) => handleInputChange('', 'shortName', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
                placeholder="Short Name"
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Short name for app icons (max 12 characters)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-mono text-gray-600">
                Description
              </label>
              <textarea
                value={pwaSettings.description}
                onChange={(e) => handleInputChange('', 'description', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
                placeholder="App Description"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                A brief description of your application
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Display Mode
              </label>
              <select
                value={pwaSettings.displayMode}
                onChange={(e) => handleInputChange('', 'displayMode', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
              >
                <option value="standalone">Standalone</option>
                <option value="minimal-ui">Minimal UI</option>
                <option value="fullscreen">Fullscreen</option>
                <option value="browser">Browser</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How the app should be displayed
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Orientation
              </label>
              <select
                value={pwaSettings.orientation}
                onChange={(e) => handleInputChange('', 'orientation', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
              >
                <option value="any">Any</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Preferred orientation for the app
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="space-y-4">
          <h3 className="font-mono font-bold text-md border-b border-gray-200 pb-2">
            App Appearance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Theme Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={pwaSettings.themeColor}
                  onChange={(e) => handleInputChange('', 'themeColor', e.target.value)}
                  className="w-12 h-10 border-2 border-gray-400"
                />
                <input
                  type="text"
                  value={pwaSettings.themeColor}
                  onChange={(e) => handleInputChange('', 'themeColor', e.target.value)}
                  className="ml-2 p-2 border-2 border-gray-400 font-mono w-32"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Primary theme color for the app
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Background Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={pwaSettings.backgroundColor}
                  onChange={(e) => handleInputChange('', 'backgroundColor', e.target.value)}
                  className="w-12 h-10 border-2 border-gray-400"
                />
                <input
                  type="text"
                  value={pwaSettings.backgroundColor}
                  onChange={(e) => handleInputChange('', 'backgroundColor', e.target.value)}
                  className="ml-2 p-2 border-2 border-gray-400 font-mono w-32"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Background color for the app splash screen
              </p>
            </div>
          </div>

          <h4 className="font-mono font-bold mt-4">App Icons</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Favicon
              </label>
              <div className="flex items-center">
                <div className="w-12 h-12 border border-gray-300 mr-2 flex items-center justify-center bg-gray-100">
                  <LazyImage
                    src={pwaSettings.icons.favicon}
                    alt="Favicon"
                    className="max-w-full max-h-full"
                    width={32}
                    height={32}
                  />
                </div>
                <input
                  type="text"
                  value={pwaSettings.icons.favicon}
                  onChange={(e) => handleInputChange('icons', 'favicon', e.target.value)}
                  className="flex-1 p-2 border-2 border-gray-400 font-mono"
                  placeholder="Favicon URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL for the favicon (32x32)
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                App Icon (192x192)
              </label>
              <div className="flex items-center">
                <div className="w-12 h-12 border border-gray-300 mr-2 flex items-center justify-center bg-gray-100">
                  <LazyImage
                    src={pwaSettings.icons.appIcon192}
                    alt="App Icon 192x192"
                    className="max-w-full max-h-full"
                    width={48}
                    height={48}
                  />
                </div>
                <input
                  type="text"
                  value={pwaSettings.icons.appIcon192}
                  onChange={(e) => handleInputChange('icons', 'appIcon192', e.target.value)}
                  className="flex-1 p-2 border-2 border-gray-400 font-mono"
                  placeholder="192x192 Icon URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL for the 192x192 app icon
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                App Icon (512x512)
              </label>
              <div className="flex items-center">
                <div className="w-12 h-12 border border-gray-300 mr-2 flex items-center justify-center bg-gray-100">
                  <LazyImage
                    src={pwaSettings.icons.appIcon512}
                    alt="App Icon 512x512"
                    className="max-w-full max-h-full"
                    width={48}
                    height={48}
                  />
                </div>
                <input
                  type="text"
                  value={pwaSettings.icons.appIcon512}
                  onChange={(e) => handleInputChange('icons', 'appIcon512', e.target.value)}
                  className="flex-1 p-2 border-2 border-gray-400 font-mono"
                  placeholder="512x512 Icon URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL for the 512x512 app icon
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Maskable Icon
              </label>
              <div className="flex items-center">
                <div className="w-12 h-12 border border-gray-300 mr-2 flex items-center justify-center bg-gray-100">
                  <LazyImage
                    src={pwaSettings.icons.maskableIcon}
                    alt="Maskable Icon"
                    className="max-w-full max-h-full"
                    width={48}
                    height={48}
                  />
                </div>
                <input
                  type="text"
                  value={pwaSettings.icons.maskableIcon}
                  onChange={(e) => handleInputChange('icons', 'maskableIcon', e.target.value)}
                  className="flex-1 p-2 border-2 border-gray-400 font-mono"
                  placeholder="Maskable Icon URL"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                URL for the maskable icon (for adaptive icons)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Install Prompt Settings */}
      {activeTab === 'install' && (
        <div className="space-y-4">
          <h3 className="font-mono font-bold text-md border-b border-gray-200 pb-2">
            Installation Prompt Settings
          </h3>

          <div className="flex items-center mb-4">
            <label className="flex items-center font-mono text-gray-600">
              <input
                type="checkbox"
                checked={pwaSettings.installPrompt.enabled}
                onChange={(e) => handleInputChange('installPrompt', 'enabled', e.target.checked)}
                className="mr-2"
              />
              Enable installation prompt
            </label>

            <Win95Button
              onClick={handleShowPreview}
              className="ml-4 px-4 py-1 font-mono text-sm"
            >
              Preview Prompt
            </Win95Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Prompt Title
              </label>
              <input
                type="text"
                value={pwaSettings.installPrompt.title}
                onChange={(e) => handleInputChange('installPrompt', 'title', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
                placeholder="Prompt Title"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Prompt Message
              </label>
              <textarea
                value={pwaSettings.installPrompt.message}
                onChange={(e) => handleInputChange('installPrompt', 'message', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
                placeholder="Prompt Message"
                rows={3}
              />
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Button Text
              </label>
              <input
                type="text"
                value={pwaSettings.installPrompt.buttonText}
                onChange={(e) => handleInputChange('installPrompt', 'buttonText', e.target.value)}
                className="w-full p-2 border-2 border-gray-400 font-mono"
                placeholder="Button Text"
              />
            </div>
          </div>

          {/* Preview */}
          {previewInstallPrompt && (
            <div className="mt-6 border-2 border-gray-400 p-4 relative">
              <h4 className="font-mono font-bold mb-2">Preview:</h4>

              <div className="bg-gray-300 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 max-w-md">
                <div className="bg-blue-900 text-white px-2 py-1 flex items-center justify-between">
                  <span className="font-mono text-sm">{pwaSettings.installPrompt.title}</span>
                  <button className="bg-gray-300 border border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-xs">×</button>
                </div>
                <div className="p-3 bg-gray-200">
                  <p className="font-mono text-sm mb-3">{pwaSettings.installPrompt.message}</p>
                  <button className="bg-gray-300 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-3 py-1 font-mono text-sm">
                    {pwaSettings.installPrompt.buttonText}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <h3 className="font-mono font-bold text-md border-b border-gray-200 pb-2">
            Installation Statistics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 border-2 border-gray-300">
              <div className="flex items-center mb-2">
                <DownloadIcon className="w-5 h-5 mr-2 text-blue-800" />
                <h4 className="font-mono font-bold">Total Installs</h4>
              </div>
              <p className="font-mono text-2xl">{pwaSettings.stats.installCount}</p>
            </div>

            <div className="bg-gray-100 p-4 border-2 border-gray-300">
              <div className="flex items-center mb-2">
                <MessageSquareIcon className="w-5 h-5 mr-2 text-blue-800" />
                <h4 className="font-mono font-bold">Install Attempts</h4>
              </div>
              <p className="font-mono text-2xl">{pwaSettings.stats.installAttempts}</p>
            </div>

            <div className="bg-gray-100 p-4 border-2 border-gray-300">
              <div className="flex items-center mb-2">
                <ClockIcon className="w-5 h-5 mr-2 text-blue-800" />
                <h4 className="font-mono font-bold">Last Installed</h4>
              </div>
              <p className="font-mono">
                {pwaSettings.stats.lastInstalled
                  ? new Date(pwaSettings.stats.lastInstalled).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Win95Button
              onClick={handleResetStats}
              className="px-4 py-2 font-mono text-red-600"
            >
              Reset Statistics
            </Win95Button>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Win95Button
          onClick={handleSave}
          className="px-6 py-2 font-mono flex items-center"
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Win95Button>
      </div>
    </div>
  );
}

// Import ClockIcon for the statistics section
const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
