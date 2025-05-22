import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { SaveIcon, CheckIcon, AlertTriangleIcon, RefreshCwIcon, DatabaseIcon } from 'lucide-react';

export function DirectFirebaseAdminPanel() {
  const [activeTab, setActiveTab] = useState<string>('toiral');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<any>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const tabs = [
    { id: 'toiral', label: 'Toiral' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'security', label: 'Security' },
    { id: 'profile', label: 'Profile' },
    { id: 'theme', label: 'Theme' }
  ];

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setHasChanges(JSON.stringify(data) !== JSON.stringify(editedData));
  }, [data, editedData]);

  const loadData = async (path: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const snapshot = await get(ref(database, path));
      if (snapshot.exists()) {
        const newData = snapshot.val();
        setData(newData);
        setEditedData(JSON.parse(JSON.stringify(newData))); // Deep copy
      } else {
        setData({});
        setEditedData({});
      }
    } catch (err) {
      console.error(`Error loading data from ${path}:`, err);
      setError(`Failed to load data from ${path}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await set(ref(database, activeTab), editedData);
      setData(JSON.parse(JSON.stringify(editedData))); // Deep copy
      setSuccess(`Data saved successfully to /${activeTab}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error saving data to ${activeTab}:`, err);
      setError(`Failed to save data to ${activeTab}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newData = JSON.parse(e.target.value);
      setEditedData(newData);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleRefresh = () => {
    loadData(activeTab);
  };

  const handleReset = () => {
    setEditedData(JSON.parse(JSON.stringify(data))); // Deep copy
    setError(null);
  };

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <DatabaseIcon className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="font-mono text-xl font-bold">Direct Firebase Admin Panel</h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-400 pb-2">
          {tabs.map(tab => (
            <Win95Button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`px-4 py-2 font-mono ${activeTab === tab.id ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
            >
              {tab.label}
            </Win95Button>
          ))}
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono font-bold">Editing /{activeTab}</h3>
            <div className="flex gap-2">
              <Win95Button 
                onClick={handleRefresh} 
                className="px-3 py-1 font-mono text-sm flex items-center"
                disabled={loading}
              >
                <RefreshCwIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Win95Button>
              <Win95Button 
                onClick={handleReset} 
                className="px-3 py-1 font-mono text-sm"
                disabled={!hasChanges || loading}
              >
                Reset
              </Win95Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCwIcon className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <p className="font-mono">Loading data...</p>
            </div>
          ) : (
            <textarea
              value={JSON.stringify(editedData, null, 2)}
              onChange={handleDataChange}
              className="w-full h-96 p-2 font-mono text-sm border-2 border-gray-400 resize-none"
              disabled={saving}
            />
          )}
        </div>
        
        <div className="flex justify-end">
          <Win95Button 
            onClick={handleSave} 
            className={`px-4 py-2 font-mono flex items-center gap-2 ${hasChanges ? 'bg-blue-100 hover:bg-blue-200' : ''}`}
            disabled={!hasChanges || saving || loading || !!error}
          >
            {saving ? (
              <>
                <SaveIcon className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Win95Button>
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
          <h3 className="font-bold mb-2">How This Works</h3>
          <p>This admin panel directly interacts with Firebase Realtime Database, bypassing any application-specific logic.</p>
          <p className="mt-2">You can edit the JSON data for each section and save it directly to Firebase.</p>
          <p className="mt-2">If the regular admin panel isn't updating the database, but this one works, the issue is likely in how the regular admin panel is interacting with Firebase.</p>
        </div>
      </div>
    </div>
  );
}
