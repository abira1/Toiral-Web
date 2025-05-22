import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get, update } from 'firebase/database';
import { database } from '../firebase/config';
import { CheckIcon, AlertTriangleIcon, DatabaseIcon, RefreshCwIcon } from 'lucide-react';

export function BookingsPathFixer() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'fixing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);

  // Check the status of the bookings path on component mount
  useEffect(() => {
    checkBookingsPath();
  }, []);

  const checkBookingsPath = async () => {
    try {
      setStatus('checking');
      setMessage('Checking bookings path...');

      const snapshot = await get(ref(database, 'bookings'));
      const pathExists = snapshot.exists();
      setExists(pathExists);

      if (pathExists) {
        const value = snapshot.val();
        setMessage(`Bookings path exists. Type: ${typeof value}, Is Array: ${Array.isArray(value)}, Value: ${JSON.stringify(value).substring(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`);
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

  const fixBookingsPath = async () => {
    try {
      setStatus('fixing');
      setMessage('EMERGENCY FIX: Attempting multiple approaches to fix bookings path...');
      
      // Try all approaches in sequence until one works
      
      // Approach 1: Try to create an empty array
      try {
        setMessage(prev => prev + '\nApproach 1: Creating bookings path with empty array...');
        await set(ref(database, 'bookings'), []);
        
        // Verify if approach 1 worked
        const snapshot = await get(ref(database, 'bookings'));
        if (snapshot.exists()) {
          setMessage(prev => prev + '\nVerification of Approach 1: SUCCESS - Bookings path exists!');
          setExists(true);
          setStatus('success');
          return;
        } else {
          setMessage(prev => prev + '\nVerification of Approach 1: FAILED - Bookings path still does not exist.');
        }
      } catch (error) {
        setMessage(prev => prev + `\nApproach 1 failed: ${error}`);
      }
      
      // Approach 2: Try to create a simple object with a dummy booking
      try {
        setMessage(prev => prev + '\nApproach 2: Creating bookings path with dummy booking object...');
        await set(ref(database, 'bookings'), {
          dummyBooking: {
            id: 'dummy',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '123-456-7890',
            serviceType: 'Test',
            date: '2023-01-01',
            time: '12:00',
            description: 'Test booking',
            status: 'pending',
            submittedAt: new Date().toISOString()
          }
        });
        
        // Verify if approach 2 worked
        const snapshot = await get(ref(database, 'bookings'));
        if (snapshot.exists()) {
          setMessage(prev => prev + '\nVerification of Approach 2: SUCCESS - Bookings path exists!');
          setExists(true);
          setStatus('success');
          return;
        } else {
          setMessage(prev => prev + '\nVerification of Approach 2: FAILED - Bookings path still does not exist.');
        }
      } catch (error) {
        setMessage(prev => prev + `\nApproach 2 failed: ${error}`);
      }
      
      // Approach 3: Try to use update instead of set
      try {
        setMessage(prev => prev + '\nApproach 3: Using update to create bookings path...');
        await update(ref(database), {
          'bookings/initialized': true
        });
        
        // Verify if approach 3 worked
        const snapshot = await get(ref(database, 'bookings'));
        if (snapshot.exists()) {
          setMessage(prev => prev + '\nVerification of Approach 3: SUCCESS - Bookings path exists!');
          setExists(true);
          setStatus('success');
          return;
        } else {
          setMessage(prev => prev + '\nVerification of Approach 3: FAILED - Bookings path still does not exist.');
        }
      } catch (error) {
        setMessage(prev => prev + `\nApproach 3 failed: ${error}`);
      }
      
      // Approach 4: Try to create a simple string value
      try {
        setMessage(prev => prev + '\nApproach 4: Creating bookings path with string value...');
        await set(ref(database, 'bookings'), "initialized");
        
        // Verify if approach 4 worked
        const snapshot = await get(ref(database, 'bookings'));
        if (snapshot.exists()) {
          setMessage(prev => prev + '\nVerification of Approach 4: SUCCESS - Bookings path exists!');
          setExists(true);
          setStatus('success');
          return;
        } else {
          setMessage(prev => prev + '\nVerification of Approach 4: FAILED - Bookings path still does not exist.');
        }
      } catch (error) {
        setMessage(prev => prev + `\nApproach 4 failed: ${error}`);
      }
      
      // If we get here, all approaches failed
      setMessage(prev => prev + '\nAll approaches failed. Bookings path still does not exist.');
      setExists(false);
      setStatus('error');
      
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
        Bookings Path Fixer
      </h2>

      <div className="mb-4 flex gap-2">
        <Win95Button
          onClick={checkBookingsPath}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'fixing'}
        >
          <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
          {status === 'checking' ? 'Checking...' : 'Check Bookings Path'}
        </Win95Button>

        <Win95Button
          onClick={fixBookingsPath}
          className="px-4 py-2 font-mono bg-red-100"
          disabled={status === 'checking' || status === 'fixing'}
        >
          <DatabaseIcon className="w-4 h-4 inline-block mr-2" />
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
