import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { RefreshCwIcon, DatabaseIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

export function RealtimeDataViewer() {
  const [selectedPath, setSelectedPath] = useState<string>('toiral');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const paths = [
    'toiral',
    'portfolio',
    'reviews',
    'contact',
    'bookings',
    'security',
    'profile',
    'theme'
  ];

  useEffect(() => {
    // Cleanup function to remove listeners when component unmounts
    return () => {
      if (listening) {
        off(ref(database, selectedPath));
      }
    };
  }, [listening, selectedPath]);

  const startListening = () => {
    setListening(true);
    setLoading(true);
    setError(null);

    const dataRef = ref(database, selectedPath);
    
    onValue(dataRef, (snapshot) => {
      setLoading(false);
      setLastUpdated(new Date());
      
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        setData(null);
        setError(`No data found at path: ${selectedPath}`);
      }
    }, (error) => {
      setLoading(false);
      setListening(false);
      setError(`Error listening to data: ${error.message}`);
    });
  };

  const stopListening = () => {
    setListening(false);
    off(ref(database, selectedPath));
  };

  const handlePathChange = (path: string) => {
    if (listening) {
      stopListening();
    }
    setSelectedPath(path);
    setData(null);
    setError(null);
    setLastUpdated(null);
  };

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <DatabaseIcon className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="font-mono text-xl font-bold">Realtime Data Viewer</h2>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Select Database Path</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {paths.map(path => (
              <Win95Button 
                key={path}
                onClick={() => handlePathChange(path)} 
                className={`px-3 py-1 font-mono text-sm ${selectedPath === path ? 'bg-blue-100' : ''}`}
              >
                {path}
              </Win95Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {!listening ? (
              <Win95Button 
                onClick={startListening} 
                className="px-4 py-2 font-mono flex items-center"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                Start Listening
              </Win95Button>
            ) : (
              <Win95Button 
                onClick={stopListening} 
                className="px-4 py-2 font-mono flex items-center"
              >
                <EyeOffIcon className="w-4 h-4 mr-2" />
                Stop Listening
              </Win95Button>
            )}
          </div>
          
          {lastUpdated && (
            <p className="mt-2 font-mono text-xs text-gray-600">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Data at /{selectedPath}</h3>
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <RefreshCwIcon className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <p className="font-mono">Loading data...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-100 p-3 border border-red-300 font-mono text-red-700">
              {error}
            </div>
          )}
          
          {!loading && !error && data === null && !listening && (
            <div className="bg-gray-100 p-3 border border-gray-300 font-mono text-gray-700">
              Click "Start Listening" to view data
            </div>
          )}
          
          {!loading && !error && data === null && listening && (
            <div className="bg-yellow-100 p-3 border border-yellow-300 font-mono text-yellow-700">
              No data found at this path
            </div>
          )}
          
          {!loading && !error && data !== null && (
            <div className="bg-gray-100 p-3 border border-gray-300 font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
          <h3 className="font-bold mb-2">How This Works</h3>
          <p>This component listens for real-time updates to the selected path in your Firebase Realtime Database.</p>
          <p className="mt-2">If you make changes to the data (e.g., through the admin panel), you should see those changes reflected here immediately.</p>
          <p className="mt-2">If you don't see updates, there may be an issue with how data is being written to Firebase.</p>
        </div>
      </div>
    </div>
  );
}
