import React, { useEffect, useState } from 'react';
import { database } from './firebase/config';
import { ref, get, update } from 'firebase/database';

export function AddPricingSection() {
  const [status, setStatus] = useState('Adding pricing section to theme settings...');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const addPricingSection = async () => {
      try {
        // Get current theme settings
        const themeRef = ref(database, 'theme');
        const snapshot = await get(themeRef);
        const themeData = snapshot.val();
        
        if (!themeData || !themeData.sections) {
          throw new Error('Theme settings not found');
        }
        
        // Check if pricing section already exists
        const pricingSectionExists = themeData.sections.some((section: any) => section.id === 'pricing');
        
        if (pricingSectionExists) {
          setStatus('Pricing section already exists in theme settings.');
          setDone(true);
          return;
        }
        
        // Add pricing section
        const newSection = {
          id: 'pricing',
          label: 'Pricing',
          icon: 'https://i.postimg.cc/Kz9zZLJV/dollar-sign.png',
          order: themeData.sections.length + 1,
          visible: true
        };
        
        const updatedSections = [...themeData.sections, newSection];
        
        // Update theme settings
        await update(themeRef, { sections: updatedSections });
        
        setStatus('Pricing section added successfully! Please refresh the page.');
        setDone(true);
      } catch (error) {
        console.error('Error adding pricing section:', error);
        setStatus(`Error adding pricing section: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    addPricingSection();
  }, []);

  return (
    <div className="p-6 bg-white">
      <h2 className="text-xl font-bold mb-4">Add Pricing Section Tool</h2>
      <p className="mb-4">{status}</p>
      {done && (
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      )}
    </div>
  );
}
