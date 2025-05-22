import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';
import { CheckIcon, AlertTriangleIcon, DatabaseIcon, RefreshCwIcon } from 'lucide-react';
// Import directly from the file, not through the index
import { robustDatabaseFix, fixBookingsPath, fixContactSubmissionsPath } from '../firebase/robustDatabaseFix';

export function RobustDatabaseFix() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(null);
  const [pathStatus, setPathStatus] = useState({
    bookings: null,
    contactSubmissions: null
  });

  // Check the status of the paths on component mount
  useEffect(() => {
    checkPaths();
  }, []);

  // Function to check the status of the paths
  const checkPaths = async () => {
    try {
      setStatus('checking');
      setMessage('Checking database paths...');

      // Check bookings path
      const bookingsSnapshot = await get(ref(database, 'bookings'));
      const bookingsExists = bookingsSnapshot.exists();
      let bookingsValid = false;

      if (bookingsExists) {
        const bookingsValue = bookingsSnapshot.val();
        bookingsValid = typeof bookingsValue === 'object';
      }

      // Check contactSubmissions path
      const contactSubmissionsSnapshot = await get(ref(database, 'contactSubmissions'));
      const contactSubmissionsExists = contactSubmissionsSnapshot.exists();
      let contactSubmissionsValid = false;

      if (contactSubmissionsExists) {
        const contactSubmissionsValue = contactSubmissionsSnapshot.val();
        contactSubmissionsValid = typeof contactSubmissionsValue === 'object';
      }

      setPathStatus({
        bookings: {
          exists: bookingsExists,
          valid: bookingsValid,
          value: bookingsExists ? JSON.stringify(bookingsSnapshot.val()).substring(0, 100) + '...' : null
        },
        contactSubmissions: {
          exists: contactSubmissionsExists,
          valid: contactSubmissionsValid,
          value: contactSubmissionsExists ? JSON.stringify(contactSubmissionsSnapshot.val()).substring(0, 100) + '...' : null
        }
      });

      setMessage('Database paths checked successfully.');
      setStatus('idle');
    } catch (error) {
      console.error('Error checking database paths:', error);
      setStatus('error');
      setMessage(`Error checking database paths: ${error.message}`);
    }
  };

  // Function to fix all database paths
  const fixAllPaths = async () => {
    try {
      setStatus('fixing');
      setMessage('Fixing all database paths...');

      const success = await robustDatabaseFix();

      if (success) {
        setMessage('All database paths fixed successfully!');
        setStatus('success');
        // Check the paths again to update the status
        await checkPaths();
      } else {
        setMessage('Failed to fix all database paths.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error fixing database paths:', error);
      setStatus('error');
      setMessage(`Error fixing database paths: ${error.message}`);
    }
  };

  // Function to fix only the bookings path
  const fixBookingsPathOnly = async () => {
    try {
      setStatus('fixing');
      setMessage('Fixing bookings path...');

      const success = await fixBookingsPath();

      if (success) {
        setMessage('Bookings path fixed successfully!');
        setStatus('success');
        // Check the paths again to update the status
        await checkPaths();
      } else {
        setMessage('Failed to fix bookings path.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error fixing bookings path:', error);
      setStatus('error');
      setMessage(`Error fixing bookings path: ${error.message}`);
    }
  };

  // Function to fix only the contactSubmissions path
  const fixContactSubmissionsPathOnly = async () => {
    try {
      setStatus('fixing');
      setMessage('Fixing contactSubmissions path...');

      const success = await fixContactSubmissionsPath();

      if (success) {
        setMessage('ContactSubmissions path fixed successfully!');
        setStatus('success');
        // Check the paths again to update the status
        await checkPaths();
      } else {
        setMessage('Failed to fix contactSubmissions path.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error fixing contactSubmissions path:', error);
      setStatus('error');
      setMessage(`Error fixing contactSubmissions path: ${error.message}`);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
        <DatabaseIcon className="w-5 h-5 mr-2" />
        Robust Database Fix
      </h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <Win95Button
          onClick={checkPaths}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'fixing'}
        >
          <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
          {status === 'checking' ? 'Checking...' : 'Check Paths'}
        </Win95Button>

        <Win95Button
          onClick={fixAllPaths}
          className="px-4 py-2 font-mono bg-blue-100"
          disabled={status === 'checking' || status === 'fixing'}
        >
          <DatabaseIcon className="w-4 h-4 inline-block mr-2" />
          {status === 'fixing' ? 'Fixing...' : 'Fix All Paths'}
        </Win95Button>

        <Win95Button
          onClick={fixBookingsPathOnly}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'fixing'}
        >
          {status === 'fixing' ? 'Fixing...' : 'Fix Bookings Path'}
        </Win95Button>

        <Win95Button
          onClick={fixContactSubmissionsPathOnly}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'fixing'}
        >
          {status === 'fixing' ? 'Fixing...' : 'Fix Contact Submissions Path'}
        </Win95Button>
      </div>

      {/* Path Status */}
      {pathStatus.bookings && (
        <div className="mb-4">
          <h3 className="font-mono font-bold mb-2">Path Status:</h3>

          <div className={`mb-2 p-2 border rounded ${
            pathStatus.bookings.exists && pathStatus.bookings.valid
              ? 'bg-green-100 border-green-400'
              : 'bg-red-100 border-red-400'
          }`}>
            <div className="font-mono font-bold">
              Bookings path: {pathStatus.bookings.exists ? (pathStatus.bookings.valid ? 'Valid' : 'Invalid') : 'Missing'}
            </div>
            {pathStatus.bookings.exists && (
              <div className="font-mono text-xs mt-1 overflow-hidden text-ellipsis">
                Value: {pathStatus.bookings.value}
              </div>
            )}
          </div>

          <div className={`mb-2 p-2 border rounded ${
            pathStatus.contactSubmissions.exists && pathStatus.contactSubmissions.valid
              ? 'bg-green-100 border-green-400'
              : 'bg-red-100 border-red-400'
          }`}>
            <div className="font-mono font-bold">
              Contact Submissions path: {pathStatus.contactSubmissions.exists ? (pathStatus.contactSubmissions.valid ? 'Valid' : 'Invalid') : 'Missing'}
            </div>
            {pathStatus.contactSubmissions.exists && (
              <div className="font-mono text-xs mt-1 overflow-hidden text-ellipsis">
                Value: {pathStatus.contactSubmissions.value}
              </div>
            )}
          </div>
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
