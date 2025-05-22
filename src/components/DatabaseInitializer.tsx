import React, { useState, useEffect } from 'react';
import { initializeRequiredPaths, checkRequiredPaths } from '../firebase/initializeRequiredPaths';
import { Win95Button } from './Win95Button';

export function DatabaseInitializer() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'initializing' | 'success' | 'error'>('idle');
  const [pathStatus, setPathStatus] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPaths();
  }, []);

  const checkPaths = async () => {
    try {
      setStatus('checking');
      const results = await checkRequiredPaths();
      setPathStatus(results);
      setStatus('idle');
    } catch (error) {
      console.error('Error checking paths:', error);
      setError('Failed to check database paths');
      setStatus('error');
    }
  };

  const handleInitialize = async () => {
    try {
      setStatus('initializing');
      setError(null);
      await initializeRequiredPaths();
      await checkPaths();
      setStatus('success');
    } catch (error) {
      console.error('Error initializing paths:', error);
      setError('Failed to initialize database paths');
      setStatus('error');
    }
  };

  const allPathsExist = Object.values(pathStatus).every(exists => exists);

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-lg mb-4">Firebase Database Paths</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-3 mb-4 rounded">
          All required paths have been initialized successfully!
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-mono font-bold mb-2">Path Status:</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(pathStatus).map(([path, exists]) => (
            <div key={path} className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-mono">{path}: {exists ? 'Exists' : 'Missing'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Win95Button
          onClick={checkPaths}
          className="px-4 py-2 font-mono"
          disabled={status === 'checking' || status === 'initializing'}
        >
          {status === 'checking' ? 'Checking...' : 'Check Paths'}
        </Win95Button>

        <Win95Button
          onClick={handleInitialize}
          className="px-4 py-2 font-mono"
          disabled={status === 'initializing' || status === 'checking' || allPathsExist}
        >
          {status === 'initializing' ? 'Initializing...' : 'Initialize Missing Paths'}
        </Win95Button>
      </div>
    </div>
  );
}
