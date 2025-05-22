import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../firebase/config';

export function FirebaseDirectTest() {
  const [testValue, setTestValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Listen for changes to the test value
  useEffect(() => {
    const testRef = ref(database, 'test/value');
    const unsubscribe = onValue(testRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentValue(snapshot.val());
      } else {
        setCurrentValue('No value set');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateValue = async () => {
    try {
      setStatus('loading');
      setError(null);
      
      // Update the test value in Firebase
      await set(ref(database, 'test/value'), testValue);
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('Error updating value:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black">
      <div className="max-w-md mx-auto">
        <h2 className="font-mono text-xl font-bold mb-4">Firebase Direct Test</h2>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Current Value in Firebase</h3>
          <div className="p-2 bg-gray-100 border border-gray-300 font-mono">
            {currentValue || 'No value set'}
          </div>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Update Value</h3>
          <div className="mb-4">
            <input
              type="text"
              value={testValue}
              onChange={(e) => setTestValue(e.target.value)}
              placeholder="Enter a new value"
              className="w-full p-2 border-2 border-gray-400 font-mono"
            />
          </div>
          <Win95Button 
            onClick={handleUpdateValue} 
            className="px-4 py-2 font-mono"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Updating...' : 
             status === 'success' ? 'Updated Successfully!' : 
             status === 'error' ? 'Update Failed' : 
             'Update Value'}
          </Win95Button>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400">
          <h3 className="font-mono font-bold mb-2">Instructions</h3>
          <ol className="list-decimal pl-5 font-mono text-sm space-y-2">
            <li>Enter a value in the input field above</li>
            <li>Click "Update Value" to save it to Firebase</li>
            <li>The current value should update automatically</li>
            <li>If it works, the issue is with the admin panel, not Firebase</li>
            <li>If it doesn't work, there's an issue with Firebase permissions or configuration</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
