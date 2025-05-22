import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get, update } from 'firebase/database';
import { database } from '../firebase/config';
import { CheckIcon, AlertTriangleIcon, DatabaseIcon } from 'lucide-react';

export function EmergencyBookingsFix() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(null);
  const [exists, setExists] = useState(null);

  // Function to check if the bookings path exists
  const checkBookingsPath = async () => {
    try {
      setStatus('checking');
      setMessage('Checking bookings path...');
      
      const snapshot = await get(ref(database, 'bookings'));
      const pathExists = snapshot.exists();
      setExists(pathExists);
      
      if (pathExists) {
        const value = snapshot.val();
        setMessage(`Bookings path exists. Type: ${typeof value}, Is Array: ${Array.isArray(value)}, Value: ${JSON.stringify(value)}`);
      } else {
        setMessage('Bookings path does not exist.');
      }
      
      setStatus('idle');
    } catch (error) {
      console.error('Error checking bookings path:', error);
      setStatus('error');
      setMessage(`Error checking bookings path: ${error.message}`);
    }
  };

  // Function to fix the bookings path using multiple approaches
  const emergencyFixBookings = async () => {
    try {
      setStatus('fixing');
      setMessage('EMERGENCY FIX: Attempting multiple approaches to fix bookings path...');
      
      // Approach 1: Try to create a simple object with a dummy booking
      try {
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
        setMessage(prev => prev + '\nApproach 1: Created bookings path with dummy booking object.');
      } catch (error) {
        setMessage(prev => prev + '\nApproach 1 failed: ' + error.message);
      }
      
      // Verify if approach 1 worked
      let snapshot = await get(ref(database, 'bookings'));
      if (snapshot.exists()) {
        setMessage(prev => prev + '\nVerification of Approach 1: SUCCESS - Bookings path exists!');
        setExists(true);
        setStatus('success');
        return;
      }
      
      // Approach 2: Try to create a simple object with a bookings array
      try {
        await set(ref(database, 'bookings'), {
          bookingsList: []
        });
        setMessage(prev => prev + '\nApproach 2: Created bookings path with bookingsList array.');
      } catch (error) {
        setMessage(prev => prev + '\nApproach 2 failed: ' + error.message);
      }
      
      // Verify if approach 2 worked
      snapshot = await get(ref(database, 'bookings'));
      if (snapshot.exists()) {
        setMessage(prev => prev + '\nVerification of Approach 2: SUCCESS - Bookings path exists!');
        setExists(true);
        setStatus('success');
        return;
      }
      
      // Approach 3: Try to create a simple string value
      try {
        await set(ref(database, 'bookings'), "initialized");
        setMessage(prev => prev + '\nApproach 3: Created bookings path with string value.');
      } catch (error) {
        setMessage(prev => prev + '\nApproach 3 failed: ' + error.message);
      }
      
      // Verify if approach 3 worked
      snapshot = await get(ref(database, 'bookings'));
      if (snapshot.exists()) {
        setMessage(prev => prev + '\nVerification of Approach 3: SUCCESS - Bookings path exists!');
        setExists(true);
        setStatus('success');
        return;
      }
      
      // Approach 4: Try to use update instead of set
      try {
        await update(ref(database), {
          'bookings/initialized': true
        });
        setMessage(prev => prev + '\nApproach 4: Used update to create bookings path.');
      } catch (error) {
        setMessage(prev => prev + '\nApproach 4 failed: ' + error.message);
      }
      
      // Final verification
      snapshot = await get(ref(database, 'bookings'));
      if (snapshot.exists()) {
        setMessage(prev => prev + '\nFinal verification: SUCCESS - Bookings path exists!');
        setExists(true);
        setStatus('success');
      } else {
        setMessage(prev => prev + '\nAll approaches failed. Bookings path still does not exist.');
        setExists(false);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error in emergency fix for bookings path:', error);
      setStatus('error');
      setMessage(prev => prev + '\nError in emergency fix: ' + error.message);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
        <DatabaseIcon className="w-5 h-5 mr-2" />
        Emergency Bookings Path Fix
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
          onClick={emergencyFixBookings}
          className="px-4 py-2 font-mono bg-red-100"
          disabled={status === 'checking' || status === 'fixing'}
        >
          {status === 'fixing' ? 'Fixing...' : 'EMERGENCY FIX'}
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
