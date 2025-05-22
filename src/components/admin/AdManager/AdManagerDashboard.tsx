import React, { useState, useEffect } from 'react';
import { getAds } from '../../../firebase/adService';
import { Ad } from '../../../types/ad.types';
import { AdList } from './AdList';
import { AdForm } from './AdForm';

export function AdManagerDashboard() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Load ads from Firebase
  const loadAds = async () => {
    setLoading(true);
    try {
      const adsData = await getAds();
      setAds(adsData);
      setError(null);
    } catch (err) {
      setError('Failed to load ads. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load ads on component mount
  useEffect(() => {
    loadAds();
  }, []);
  
  // Handle creating a new ad
  const handleCreateNew = () => {
    setSelectedAd(null);
    setIsCreating(true);
  };
  
  // Handle editing an existing ad
  const handleEdit = (ad: Ad) => {
    setSelectedAd(ad);
    setIsCreating(false);
  };
  
  // Handle form cancel
  const handleCancel = () => {
    setSelectedAd(null);
    setIsCreating(false);
  };
  
  // Handle form submission success
  const handleSuccess = () => {
    setSelectedAd(null);
    setIsCreating(false);
    loadAds();
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono">Ad Manager</h2>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-mono text-sm"
        >
          Create New Ad
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 font-mono">Loading ads...</p>
        </div>
      ) : isCreating || selectedAd ? (
        <AdForm 
          ad={selectedAd} 
          isCreating={isCreating} 
          onCancel={handleCancel} 
          onSuccess={handleSuccess} 
        />
      ) : (
        <AdList 
          ads={ads} 
          onEdit={handleEdit} 
          onRefresh={loadAds} 
        />
      )}
    </div>
  );
}
