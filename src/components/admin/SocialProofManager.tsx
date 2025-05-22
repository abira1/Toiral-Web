import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, off, set } from 'firebase/database';
import { Win95Button } from '../Win95Button';
import { PlusIcon, TrashIcon, SaveIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface SocialStats {
  [key: string]: number;
}

export function SocialProofManager() {
  const [stats, setStats] = useState<SocialStats>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load social stats from Firebase
  useEffect(() => {
    const socialStatsRef = ref(database, 'socialStats');
    
    const handleData = (snapshot: any) => {
      if (snapshot.exists()) {
        setStats(snapshot.val());
      } else {
        // If no data exists, initialize with empty object
        setStats({});
      }
      setLoading(false);
    };
    
    const handleError = (error: any) => {
      console.error('Error loading social stats:', error);
      setError('Failed to load social statistics');
      setLoading(false);
    };
    
    onValue(socialStatsRef, handleData, handleError);
    
    return () => {
      off(socialStatsRef);
    };
  }, []);

  // Add a new social platform
  const handleAddPlatform = () => {
    const platformName = prompt('Enter the platform name (e.g., facebook, twitter, instagram, clients, projects):');
    
    if (!platformName) return;
    
    const normalizedName = platformName.toLowerCase().trim();
    
    if (stats[normalizedName] !== undefined) {
      setError(`Platform "${normalizedName}" already exists`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setStats(prev => ({
      ...prev,
      [normalizedName]: 0
    }));
    
    setSuccess(`Added platform "${normalizedName}"`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Remove a social platform
  const handleRemovePlatform = (platform: string) => {
    if (!window.confirm(`Are you sure you want to remove "${platform}"?`)) {
      return;
    }
    
    const newStats = { ...stats };
    delete newStats[platform];
    setStats(newStats);
    
    setSuccess(`Removed platform "${platform}"`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Update a platform's count
  const handleUpdateCount = (platform: string, value: string) => {
    const count = parseInt(value, 10);
    
    if (isNaN(count) || count < 0) {
      setError(`Invalid count for "${platform}". Please enter a positive number.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setStats(prev => ({
      ...prev,
      [platform]: count
    }));
  };

  // Save changes to Firebase
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const socialStatsRef = ref(database, 'socialStats');
      await set(socialStatsRef, stats);
      
      setSuccess('Social statistics saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving social stats:', error);
      setError('Failed to save social statistics');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white border-2 border-gray-400">
        <p className="font-mono text-center">Loading social statistics...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="bg-white border-2 border-gray-400 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono font-bold text-lg">Social Proof Manager</h3>
          <div className="flex gap-2">
            <Win95Button
              onClick={handleAddPlatform}
              className="px-3 py-1 font-mono text-sm flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Platform
            </Win95Button>
            <Win95Button
              onClick={handleSave}
              className="px-3 py-1 font-mono text-sm flex items-center"
              disabled={saving}
            >
              {saving ? (
                <RefreshCwIcon className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4 mr-1" />
              )}
              Save Changes
            </Win95Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 font-mono text-sm flex items-center">
            <AlertTriangleIcon className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 text-green-700 font-mono text-sm">
            {success}
          </div>
        )}

        {Object.keys(stats).length === 0 ? (
          <div className="text-center py-8 bg-gray-100 border-2 border-gray-300">
            <p className="font-mono text-gray-600">No social platforms added yet.</p>
            <p className="font-mono text-sm text-gray-500 mt-2">
              Click "Add Platform" to add your first social platform.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(stats).map(([platform, count]) => (
              <div key={platform} className="flex items-center gap-4 p-3 bg-gray-100 border-2 border-gray-300">
                <div className="w-1/3 font-mono font-bold capitalize">{platform}</div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => handleUpdateCount(platform, e.target.value)}
                    className="w-full p-2 font-mono border-2 border-gray-400"
                    min="0"
                  />
                </div>
                <Win95Button
                  onClick={() => handleRemovePlatform(platform)}
                  className="px-2 py-1 font-mono text-sm bg-red-100"
                  title={`Remove ${platform}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </Win95Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-300">
          <h4 className="font-mono font-bold mb-2">Tips:</h4>
          <ul className="list-disc pl-5 font-mono text-sm space-y-1">
            <li>Add platforms like "facebook", "twitter", "instagram", etc. for social media followers</li>
            <li>You can also add metrics like "clients" or "projects" to showcase your business growth</li>
            <li>The numbers will be automatically formatted (e.g., 1500 will display as 1.5K)</li>
            <li>These statistics will be displayed in the Social Proof component on your website</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
