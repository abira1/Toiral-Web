import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';
import { AlertTriangleIcon, CheckIcon, DatabaseIcon } from 'lucide-react';

export function InitializeMissingPaths() {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const initializeMissingPaths = async () => {
    try {
      setStatus('initializing');
      setMessage('Initializing missing paths...');

      // Check and initialize bookings path
      const bookingsSnapshot = await get(ref(database, 'bookings'));
      if (!bookingsSnapshot.exists()) {
        await set(ref(database, 'bookings'), []);
        setMessage(prev => prev + '\nInitialized bookings path.');
      } else {
        setMessage(prev => prev + '\nBookings path already exists.');
      }

      // Check and initialize contactSubmissions path
      const contactSubmissionsSnapshot = await get(ref(database, 'contactSubmissions'));
      if (!contactSubmissionsSnapshot.exists()) {
        await set(ref(database, 'contactSubmissions'), []);
        setMessage(prev => prev + '\nInitialized contactSubmissions path.');
      } else {
        setMessage(prev => prev + '\nContactSubmissions path already exists.');
      }

      // Check and initialize contactInfo path
      const contactInfoSnapshot = await get(ref(database, 'contactInfo'));
      if (!contactInfoSnapshot.exists()) {
        await set(ref(database, 'contactInfo'), {
          officeHours: {
            days: 'Monday - Friday',
            hours: '9:00 AM - 6:00 PM',
            timezone: 'GMT+6'
          },
          phone: '+880 1804-673095',
          email: 'contract.toiral@gmail.com',
          socialMedia: []
        });
        setMessage(prev => prev + '\nInitialized contactInfo path.');
      } else {
        setMessage(prev => prev + '\nContactInfo path already exists.');
      }

      // Check and initialize ads path
      const adsSnapshot = await get(ref(database, 'ads'));
      if (!adsSnapshot.exists()) {
        await set(ref(database, 'ads'), { ads: [] });
        setMessage(prev => prev + '\nInitialized ads path.');
      } else {
        setMessage(prev => prev + '\nAds path already exists.');
      }

      // Check and initialize socialStats path
      const socialStatsSnapshot = await get(ref(database, 'socialStats'));
      if (!socialStatsSnapshot.exists()) {
        await set(ref(database, 'socialStats'), {
          facebook: 0,
          twitter: 0,
          instagram: 0,
          linkedin: 0,
          clients: 0,
          projects: 0
        });
        setMessage(prev => prev + '\nInitialized socialStats path.');
      } else {
        setMessage(prev => prev + '\nSocialStats path already exists.');
      }

      // Check and initialize community path
      const communitySnapshot = await get(ref(database, 'community'));
      if (!communitySnapshot.exists()) {
        await set(ref(database, 'community'), {
          categories: {
            category1: {
              name: 'General Discussion',
              description: 'General topics and discussions about our services',
              order: 0
            },
            category2: {
              name: 'Questions & Support',
              description: 'Ask questions and get help from our community',
              order: 1
            }
          },
          topics: {},
          posts: {}
        });
        setMessage(prev => prev + '\nInitialized community path.');
      } else {
        setMessage(prev => prev + '\nCommunity path already exists.');
      }

      setStatus('success');
      setMessage(prev => prev + '\n\nAll missing paths have been initialized successfully!');
    } catch (error) {
      console.error('Error initializing missing paths:', error);
      setStatus('error');
      setMessage(`Error initializing missing paths: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
        <DatabaseIcon className="w-5 h-5 mr-2" />
        Initialize Missing Paths
      </h2>

      <div className="mb-4">
        <Win95Button
          onClick={initializeMissingPaths}
          className="px-4 py-2 font-mono"
          disabled={status === 'initializing'}
        >
          {status === 'initializing' ? 'Initializing...' : 'Initialize Missing Paths'}
        </Win95Button>
      </div>

      {message && (
        <div className={`p-3 border-2 rounded whitespace-pre-line font-mono text-sm ${
          status === 'error' 
            ? 'bg-red-100 border-red-400 text-red-700' 
            : status === 'success'
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-blue-100 border-blue-400 text-blue-700'
        }`}>
          {status === 'error' && <AlertTriangleIcon className="w-5 h-5 inline-block mr-2" />}
          {status === 'success' && <CheckIcon className="w-5 h-5 inline-block mr-2" />}
          {message}
        </div>
      )}
    </div>
  );
}
