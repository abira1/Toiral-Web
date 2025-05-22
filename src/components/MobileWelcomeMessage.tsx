import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';

export function MobileWelcomeMessage() {
  const [visible, setVisible] = useState(false);
  const { content } = useContent();

  // Get welcome message settings from content context
  const settings = content?.mobileWelcome || {
    enabled: false,
    message: 'Welcome to Toiral Web - Swipe and tap to navigate',
    showOnlyOnFirstVisit: true,
    autoHideAfter: 5000 // milliseconds
  };

  useEffect(() => {
    // If message is disabled in admin panel, don't show it
    if (!settings.enabled) return;

    // Check if this is the first visit (if that setting is enabled)
    const hasSeenWelcome = localStorage.getItem('toiral_seen_mobile_welcome');

    // Only show on mobile devices
    const isMobile = window.innerWidth <= 768;

    // Determine if we should show the message
    const shouldShow = isMobile && (!settings.showOnlyOnFirstVisit || !hasSeenWelcome);

    if (shouldShow) {
      setVisible(true);

      // Mark as seen if we're tracking that
      if (settings.showOnlyOnFirstVisit) {
        localStorage.setItem('toiral_seen_mobile_welcome', 'true');
      }

      // Auto-hide after specified time if greater than 0
      if (settings.autoHideAfter > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, settings.autoHideAfter);

        return () => clearTimeout(timer);
      }
    }
  }, [settings]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 mx-auto max-w-sm bg-gray-300 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-3 shadow-lg">
      <div className="flex justify-between items-center">
        <p className="font-mono text-sm">{settings.message}</p>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 bg-gray-400 hover:bg-gray-500 w-6 h-6 flex items-center justify-center border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}
