import React, { useEffect, useState } from 'react';
import { database } from './firebase/config';
import { ref, set } from 'firebase/database';
import { defaultSettings } from './contexts/ThemeContext';

export function ResetTheme() {
  const [status, setStatus] = useState('Resetting theme settings...');

  useEffect(() => {
    const resetTheme = async () => {
      try {
        const themeRef = ref(database, 'theme');
        await set(themeRef, defaultSettings);
        setStatus('Theme settings reset successfully! Please refresh the page.');
      } catch (error) {
        console.error('Error resetting theme settings:', error);
        setStatus('Error resetting theme settings. See console for details.');
      }
    };

    resetTheme();
  }, []);

  return (
    <div className="p-6 bg-white">
      <h2 className="text-xl font-bold mb-4">Theme Reset Tool</h2>
      <p className="mb-4">{status}</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Return to Home
      </button>
    </div>
  );
}
