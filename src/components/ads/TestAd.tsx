import React from 'react';
import { Ad } from '../../types/ad.types';
import { AdBanner } from './AdBanner';
import { AdPopup } from './AdPopup';

// This component is for testing purposes only
export function TestAd() {
  // Create a test ad
  const testAd: Ad = {
    id: 'test-ad',
    type: 'banner',
    title: 'Test Ad',
    content: {
      heading: 'Test Banner Ad',
      body: 'This is a test ad to verify the ad system is working.',
      mediaType: 'image',
      mediaUrl: 'https://via.placeholder.com/300x150?text=Test+Ad',
      buttonText: 'Test Button',
      buttonUrl: '#'
    },
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#3B82F6',
      borderRadius: '0.375rem'
    },
    animation: {
      type: 'fade',
      direction: 'bottom',
      duration: 0.5
    },
    display: {
      position: 'bottom',
      startDate: Date.now() - 1000, // 1 second ago
      endDate: Date.now() + 24 * 60 * 60 * 1000, // 1 day from now
      frequency: 'always',
      delay: 1,
      showOnPages: [],
      closeAfter: 0
    },
    stats: {
      impressions: 0,
      clicks: 0,
      closes: 0
    },
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Mock close function
  const handleClose = () => {
    console.log('Test ad closed');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ad System Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Banner Ad Test</h2>
        <div className="relative h-32 border border-gray-300 rounded">
          <AdBanner ad={testAd} onClose={handleClose} />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Popup Ad Test</h2>
        <div className="relative h-64 border border-gray-300 rounded">
          <AdPopup ad={{...testAd, type: 'popup'}} onClose={handleClose} />
        </div>
      </div>
    </div>
  );
}
