import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Ad, AdImpressionRecord } from '../../types/ad.types';
import { subscribeToActiveAds, initializeAdsCollection } from '../../firebase/adService';
import { checkAdsPermission } from '../../firebase/checkDatabaseRules';
import { AdBanner } from './AdBanner';
import { AdPopup } from './AdPopup';

// Local storage key for tracking ad impressions
const AD_IMPRESSIONS_KEY = 'toiral_ad_impressions';

export function AdManager() {
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [visibleAds, setVisibleAds] = useState<Ad[]>([]);
  // Keep track of recently closed ads to prevent immediate reappearance
  const [recentlyClosedAds, setRecentlyClosedAds] = useState<Set<string>>(new Set());
  const location = useLocation();

  // Check database permissions and subscribe to active ads
  useEffect(() => {
    console.log('AdManager: Checking permissions and subscribing to active ads...');

    let unsubscribeFunc: (() => void) | undefined;

    // First check if we have permission to access the ads path
    checkAdsPermission().then(async (hasPermission) => {
      if (hasPermission) {
        console.log('AdManager: Permission check passed');

        try {
          // Initialize the ads collection if it doesn't exist
          await initializeAdsCollection();

          console.log('AdManager: Subscribing to ads');
          unsubscribeFunc = subscribeToActiveAds((ads) => {
            console.log('AdManager: Received ads from Firebase:', ads);
            setActiveAds(ads);
          });
        } catch (error) {
          console.error('AdManager: Error initializing ads collection:', error);
        }
      } else {
        console.error('AdManager: Permission check failed, cannot access ads');
      }
    });

    // Cleanup function
    return () => {
      if (unsubscribeFunc) {
        console.log('AdManager: Unsubscribing from active ads');
        unsubscribeFunc();
      }
    };
  }, []);

  // Determine which ads to show based on current page and frequency settings
  useEffect(() => {
    const currentPath = location.pathname;
    const now = Date.now();

    // Don't show ads on admin pages
    const isAdminPage = currentPath.includes('/admin') ||
                        currentPath.includes('/login') ||
                        currentPath === '/notifications';

    if (isAdminPage) {
      console.log('AdManager: Not showing ads on admin page:', currentPath);
      setVisibleAds([]);
      return;
    }

    // Filter ads based on page targeting, but be more lenient
    const eligibleAds = activeAds.filter(ad => {
      // If display or showOnPages doesn't exist, consider it eligible for all pages
      if (!ad.display || !ad.display.showOnPages) {
        console.log('Ad is missing display or showOnPages property, showing on all pages:', ad);
        return true;
      }

      // If showOnPages is empty or includes current path, ad is eligible
      return (
        ad.display.showOnPages.length === 0 ||
        ad.display.showOnPages.includes(currentPath)
      );
    });

    // Check frequency against local storage records
    const impressionRecords = getImpressionRecords();

    const adsToShow = eligibleAds.filter(ad => {
      if (!ad.id) {
        console.log('Ad is missing id, generating one:', ad);
        ad.id = 'generated-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
      }

      // Skip ads without title or heading
      if (!ad.title?.trim() || !ad.content?.heading?.trim()) {
        console.log(`Ad ${ad.id} is missing title or heading, skipping:`, ad);
        return false;
      }

      // Check if this ad was recently closed
      if (recentlyClosedAds.has(ad.id)) {
        console.log(`Ad ${ad.id} was recently closed, preventing immediate reappearance`);
        return false;
      }

      // Check if display and frequency exist
      if (!ad.display || !ad.display.frequency) {
        console.log('Ad is missing display or frequency property, showing always:', ad);
        return true;
      }

      const record = impressionRecords[ad.id];

      // If no record exists, show the ad
      if (!record) return true;

      // Check if the ad was recently closed
      if (record.closedAt) {
        // Get the minimum time before showing a closed ad again
        // Use the ad's setting if available, otherwise default to 30 seconds
        // Use nullish coalescing to properly handle 0 values
        const minTimeSeconds = ad.display.minTimeBetweenDisplays !== undefined ? ad.display.minTimeBetweenDisplays : 30;

        // If minTimeSeconds is 0, always show the ad regardless of when it was closed
        if (minTimeSeconds === 0) {
          console.log(`Ad ${ad.id} has minTimeBetweenDisplays=0, showing immediately after close`);
          return true;
        }

        const MIN_TIME_AFTER_CLOSE = minTimeSeconds * 1000; // Convert to milliseconds
        const timeSinceClose = now - record.closedAt;

        // If the ad was closed recently, don't show it again yet
        if (timeSinceClose < MIN_TIME_AFTER_CLOSE) {
          console.log(`Ad ${ad.id} was closed ${timeSinceClose/1000}s ago, waiting for ${minTimeSeconds}s before showing again`);
          return false;
        }
      }

      // Check frequency settings
      switch (ad.display.frequency) {
        case 'once':
          return record.showCount === 0;
        case 'daily':
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          return record.lastShown < oneDayAgo;
        case 'hourly':
          const oneHourAgo = now - 60 * 60 * 1000;
          return record.lastShown < oneHourAgo;
        case 'always':
          // Even with 'always' frequency, respect the minimum time after closing
          // For 'always' frequency, we've already checked the minTimeBetweenDisplays above
          return true;
        default:
          return true;
      }
    });

    console.log('AdManager: Filtered ads to show:', adsToShow);

    // If no ads to show but we have active ads, show the first active ad as a fallback
    if (adsToShow.length === 0 && activeAds.length > 0) {
      console.log('AdManager: No ads to show after filtering, using first active ad as fallback');
      setVisibleAds([activeAds[0]]);
    } else {
      setVisibleAds(adsToShow);
    }
  }, [activeAds, location.pathname, recentlyClosedAds]);

  // Get impression records from local storage
  const getImpressionRecords = (): Record<string, AdImpressionRecord> => {
    try {
      const stored = localStorage.getItem(AD_IMPRESSIONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading ad impressions from localStorage:', error);
      return {};
    }
  };

  // Update impression record for an ad
  const updateImpressionRecord = (adId: string, wasClosed: boolean = false) => {
    try {
      const records = getImpressionRecords();
      const now = Date.now();

      // Get the current record or create a new one
      const currentRecord = records[adId] || { adId, lastShown: 0, showCount: 0, closedAt: 0 };

      records[adId] = {
        ...currentRecord,
        adId,
        lastShown: now,
        showCount: currentRecord.showCount + 1,
        // If the ad was closed, record the close time
        ...(wasClosed && { closedAt: now })
      };

      console.log(`Updating impression record for ad ${adId}:`, records[adId]);
      localStorage.setItem(AD_IMPRESSIONS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error updating ad impression record:', error);
    }
  };

  // Handle closing an ad
  const handleCloseAd = (adId: string) => {
    if (adId) {
      // Mark the ad as closed in the impression record
      updateImpressionRecord(adId, true);
      console.log(`Ad ${adId} was closed, updating impression record`);

      // Add to recently closed ads to prevent immediate reappearance
      setRecentlyClosedAds(prev => {
        const newSet = new Set(prev);
        newSet.add(adId);
        return newSet;
      });

      // Set a timeout to remove from recently closed ads after a short delay
      // This ensures the ad doesn't reappear immediately due to React's render cycle
      setTimeout(() => {
        setRecentlyClosedAds(prev => {
          const newSet = new Set(prev);
          newSet.delete(adId);
          return newSet;
        });
      }, 1000); // 1 second delay to prevent immediate reappearance
    }

    setVisibleAds(prev => prev.filter(ad => ad.id !== adId));
  };

  // Add a debug state to track what's happening
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug info
  const addDebugInfo = (info: string) => {
    console.log('AdManager Debug:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`].slice(-10));
  };

  // Add debug info when component mounts
  useEffect(() => {
    addDebugInfo('AdManager component mounted');

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      // Force create a test ad directly
      const testAd: Ad = {
        id: 'test-ad-' + Date.now(),
        type: 'banner',
        title: 'Test Ad - Development Mode',
        content: {
          heading: 'Test Banner Ad - Development Mode',
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

      // Add the test ad to visible ads directly (bypassing Firebase)
      addDebugInfo('Adding test ad directly to component');
      setVisibleAds([testAd]);
    }
  }, []);

  // Update debug info when activeAds changes
  useEffect(() => {
    addDebugInfo(`Active ads updated: ${activeAds.length} ads`);
  }, [activeAds]);

  // Update debug info when visibleAds changes
  useEffect(() => {
    addDebugInfo(`Visible ads updated: ${visibleAds.length} ads`);
  }, [visibleAds]);

  return (
    <>

      {/* Render ads */}
      {visibleAds.map(ad => (
        <React.Fragment key={ad.id}>
          {ad.type === 'banner' ? (
            <AdBanner ad={ad} onClose={() => handleCloseAd(ad.id!)} />
          ) : (
            <AdPopup ad={ad} onClose={() => handleCloseAd(ad.id!)} />
          )}
        </React.Fragment>
      ))}
    </>
  );
}
