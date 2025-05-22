import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { SaveIcon, RefreshCwIcon, ToggleLeftIcon, ToggleRightIcon, MessageSquareIcon } from 'lucide-react';
import { database } from '../../firebase/config';
import { ref, get, set } from 'firebase/database';

export function MobileWelcomeManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    message: 'Welcome to Toiral Web - Swipe and tap to navigate',
    showOnlyOnFirstVisit: true,
    autoHideAfter: 5000 // milliseconds
  });

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settingsRef = ref(database, 'mobileWelcome');
        const snapshot = await get(settingsRef);
        
        if (snapshot.exists()) {
          setSettings(snapshot.val());
        }
      } catch (error) {
        console.error('Error loading mobile welcome settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings to Firebase
  const saveSettings = async () => {
    try {
      setSaving(true);
      const settingsRef = ref(database, 'mobileWelcome');
      await set(settingsRef, settings);
      alert('Mobile welcome message settings saved successfully!');
    } catch (error) {
      console.error('Error saving mobile welcome settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-200 text-center">
        <RefreshCwIcon className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-2" />
        <p className="font-mono">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-200">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-mono font-bold text-xl">Mobile Welcome Message</h2>
        <Win95Button
          onClick={saveSettings}
          className="px-4 py-2 font-mono flex items-center"
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
              Save Settings
            </>
          )}
        </Win95Button>
      </div>

      <div className="space-y-6 bg-white p-6 border-2 border-gray-400 border-r-gray-800 border-b-gray-800">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-mono font-bold block mb-1">Enable Mobile Welcome Message</label>
            <p className="font-mono text-sm text-gray-600">Show a welcome message to mobile users</p>
          </div>
          <Win95Button
            onClick={() => handleChange('enabled', !settings.enabled)}
            className={`px-4 py-2 font-mono flex items-center ${settings.enabled ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            {settings.enabled ? (
              <>
                <ToggleRightIcon className="w-4 h-4 mr-2 text-green-600" />
                Enabled
              </>
            ) : (
              <>
                <ToggleLeftIcon className="w-4 h-4 mr-2 text-gray-600" />
                Disabled
              </>
            )}
          </Win95Button>
        </div>

        {/* Message Content */}
        <div>
          <label className="font-mono font-bold block mb-1">Welcome Message</label>
          <div className="flex items-center">
            <MessageSquareIcon className="w-5 h-5 mr-2 text-blue-600" />
            <input
              type="text"
              value={settings.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter welcome message..."
            />
          </div>
        </div>

        {/* Show Only on First Visit Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="font-mono font-bold block mb-1">Show Only on First Visit</label>
            <p className="font-mono text-sm text-gray-600">If enabled, the message will only show once per user</p>
          </div>
          <Win95Button
            onClick={() => handleChange('showOnlyOnFirstVisit', !settings.showOnlyOnFirstVisit)}
            className={`px-4 py-2 font-mono flex items-center ${settings.showOnlyOnFirstVisit ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            {settings.showOnlyOnFirstVisit ? (
              <>
                <ToggleRightIcon className="w-4 h-4 mr-2 text-green-600" />
                First Visit Only
              </>
            ) : (
              <>
                <ToggleLeftIcon className="w-4 h-4 mr-2 text-gray-600" />
                Show Every Time
              </>
            )}
          </Win95Button>
        </div>

        {/* Auto-hide Duration */}
        <div>
          <label className="font-mono font-bold block mb-1">Auto-hide After (seconds)</label>
          <p className="font-mono text-sm text-gray-600 mb-2">Set to 0 to disable auto-hiding</p>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="60"
              value={settings.autoHideAfter / 1000}
              onChange={(e) => handleChange('autoHideAfter', parseInt(e.target.value) * 1000)}
              className="w-24 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
            />
            <span className="ml-2 font-mono">seconds</span>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8">
          <h3 className="font-mono font-bold mb-4 border-b-2 border-gray-300 pb-2">Preview</h3>
          <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-100">
            <div className="max-w-sm mx-auto bg-gray-300 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-3 shadow-lg">
              <div className="flex justify-between items-center">
                <p className="font-mono text-sm">{settings.message}</p>
                <button className="ml-2 bg-gray-400 hover:bg-gray-500 w-6 h-6 flex items-center justify-center border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800">
                  ×
                </button>
              </div>
            </div>
            <p className="text-center mt-4 font-mono text-sm text-gray-600">
              {settings.enabled ? 'This message will be shown on mobile devices.' : 'This message is currently disabled.'}
              {settings.enabled && settings.showOnlyOnFirstVisit && ' It will only appear on first visit.'}
              {settings.enabled && settings.autoHideAfter > 0 && ` It will auto-hide after ${settings.autoHideAfter / 1000} seconds.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
