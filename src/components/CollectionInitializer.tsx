import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { initializeAllCollections } from '../firebase/initializeCollections';
import { CheckIcon, AlertTriangleIcon, DatabaseIcon } from 'lucide-react';

export function CollectionInitializer() {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    try {
      setStatus('initializing');
      setError(null);
      
      const success = await initializeAllCollections();
      
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError('Some collections failed to initialize. Check the console for details.');
      }
    } catch (err) {
      console.error('Error initializing collections:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <DatabaseIcon className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="font-mono text-xl font-bold">Firebase Collection Initializer</h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p>All collections initialized successfully!</p>
            </div>
          </div>
        )}
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Initialize Required Collections</h3>
          <p className="font-mono text-sm mb-4">
            This will create the following collections in your Firebase Realtime Database:
          </p>
          <ul className="list-disc pl-5 font-mono text-sm mb-4">
            <li>toiral</li>
            <li>portfolio</li>
            <li>reviews</li>
            <li>contact</li>
            <li>bookings</li>
            <li>security</li>
            <li>profile</li>
            <li>theme</li>
          </ul>
          <p className="font-mono text-sm mb-4">
            Each collection will be initialized with a basic structure containing a dummy value.
          </p>
          <Win95Button 
            onClick={handleInitialize} 
            className="px-4 py-2 font-mono w-full"
            disabled={status === 'initializing'}
          >
            {status === 'initializing' ? 'Initializing...' : 'Initialize Collections'}
          </Win95Button>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400">
          <h3 className="font-mono font-bold mb-2">Next Steps</h3>
          <p className="font-mono text-sm mb-2">
            After initializing the collections:
          </p>
          <ol className="list-decimal pl-5 font-mono text-sm">
            <li className="mb-1">Verify that the collections are created in your Firebase Realtime Database</li>
            <li className="mb-1">Check that the database rules are set to allow read and write access</li>
            <li className="mb-1">Test the admin panel functionality to ensure it can read and write to all collections</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
