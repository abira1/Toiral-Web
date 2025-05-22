import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';
import { AlertTriangleIcon, CheckIcon, DatabaseIcon } from 'lucide-react';
import { fixBookingsPath, fixContactSubmissionsPath } from '../firebase';

export function FixBookingsPath() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'fixing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);

  const checkBookingsPath = async () => {
    try {
      setStatus('checking');
      setMessage('Checking bookings path...');

      const snapshot = await get(ref(database, 'bookings'));
      const pathExists = snapshot.exists();
      setExists(pathExists);

      if (pathExists) {
        setMessage('Bookings path exists. Value type: ' + (Array.isArray(snapshot.val()) ? 'Array' : typeof snapshot.val()));
      } else {
        setMessage('Bookings path does not exist.');
      }

      setStatus('idle');
    } catch (error) {
      console.error('Error checking bookings path:', error);
      setStatus('error');
      setMessage(`Error checking bookings path: ${error}`);
    }
  };

  const handleFixBookingsPath = async () => {
    try {
      setStatus('fixing');
      setMessage('Fixing bookings path...');

      // Use the imported function to fix the bookings path
      const success = await fixBookingsPath();

      if (success) {
        // Also fix the contactSubmissions path while we're at it
        await fixContactSubmissionsPath();

        // Verify the path was created
        const snapshot = await get(ref(database, 'bookings'));
        if (snapshot.exists()) {
          setExists(true);
          setMessage('Bookings path fixed successfully!\n\nAlso fixed contactSubmissions path.');
          setStatus('success');
        } else {
          throw new Error('Failed to verify bookings path exists after fixing');
        }
      } else {
        throw new Error('Failed to fix bookings path');
      }
    } catch (error) {
      console.error('Error fixing bookings path:', error);
      setStatus('error');
      setMessage(`Error fixing bookings path: ${error}`);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
        <DatabaseIcon className="w-5 h-5 mr-2" />
        Fix Bookings Path
      </h2>

      <div className="mb-4 flex gap-2">
        <Win95Button
          onClick={checkBookingsPath}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'fixing'}
        >
          {status === 'checking' ? 'Checking...' : 'Check Bookings Path'}
        </Win95Button>

        <Win95Button
          onClick={handleFixBookingsPath}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'fixing'}
        >
          {status === 'fixing' ? 'Fixing...' : 'Fix Bookings Path'}
        </Win95Button>
      </div>

      {exists !== null && (
        <div className={`mb-4 p-2 border rounded ${exists ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
          <span className="font-mono">
            Bookings path: {exists ? 'Exists' : 'Missing'}
          </span>
        </div>
      )}

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
