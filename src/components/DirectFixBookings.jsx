import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';
import { CheckIcon, AlertTriangleIcon, DatabaseIcon } from 'lucide-react';

export function DirectFixBookings() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(null);

  const fixBookingsPath = async () => {
    try {
      setStatus('fixing');
      setMessage('Attempting to fix bookings path...');

      // First, try to remove the path completely
      try {
        await set(ref(database, 'bookings'), null);
        setMessage(prev => prev + '\nRemoved existing bookings path.');
      } catch (error) {
        setMessage(prev => prev + '\nError removing existing path: ' + error);
      }

      // Wait a moment to ensure the deletion is processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now create the path with an empty array
      try {
        await set(ref(database, 'bookings'), []);
        setMessage(prev => prev + '\nCreated bookings path with empty array.');
      } catch (error) {
        setMessage(prev => prev + '\nError creating bookings path: ' + error);
        throw error;
      }

      // Wait a moment to ensure the creation is processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify the path was created
      const snapshot = await get(ref(database, 'bookings'));
      if (snapshot.exists()) {
        setMessage(prev => prev + '\nVerified bookings path exists!');
        setStatus('success');
      } else {
        setMessage(prev => prev + '\nFailed to verify bookings path exists after creation.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error fixing bookings path:', error);
      setStatus('error');
      setMessage(prev => prev + '\nError: ' + error.message);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
        <DatabaseIcon className="w-5 h-5 mr-2" />
        Direct Fix for Bookings Path
      </h2>

      <div className="mb-4">
        <Win95Button
          onClick={fixBookingsPath}
          className="px-4 py-2 font-mono"
          disabled={status === 'fixing'}
        >
          {status === 'fixing' ? 'Fixing...' : 'Fix Bookings Path Now'}
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
