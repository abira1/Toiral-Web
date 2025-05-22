import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { verifyAndInitializeDatabase, logDatabaseStructure } from '../firebase/verifyDatabaseStructure';
import { CheckIcon, AlertTriangleIcon, DatabaseIcon, RefreshCwIcon, ListIcon } from 'lucide-react';

export function DatabaseVerifier() {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    existingNodes: string[];
    initializedNodes: string[];
    failedNodes: string[];
  } | null>(null);

  const handleVerify = async () => {
    try {
      setStatus('verifying');
      setError(null);
      setResult(null);
      
      const { success, existingNodes, initializedNodes, failedNodes } = await verifyAndInitializeDatabase();
      
      setResult({
        existingNodes,
        initializedNodes,
        failedNodes
      });
      
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(`Failed to initialize nodes: ${failedNodes.join(', ')}`);
      }
      
      // Log the current database structure
      await logDatabaseStructure();
    } catch (err) {
      console.error('Error verifying database structure:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <DatabaseIcon className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="font-mono text-xl font-bold">Firebase Database Verifier</h2>
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
            <div className="flex items-center mb-2">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p>Database structure verified and initialized successfully!</p>
            </div>
            {result && (
              <div className="pl-7">
                {result.existingNodes.length > 0 && (
                  <div className="mb-2">
                    <p className="font-bold">Existing nodes:</p>
                    <ul className="list-disc pl-5">
                      {result.existingNodes.map(node => (
                        <li key={node}>{node}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.initializedNodes.length > 0 && (
                  <div>
                    <p className="font-bold">Newly initialized nodes:</p>
                    <ul className="list-disc pl-5">
                      {result.initializedNodes.map(node => (
                        <li key={node}>{node}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Verify Database Structure</h3>
          <p className="font-mono text-sm mb-4">
            This will verify that all required nodes exist in your Firebase Realtime Database and initialize any missing nodes.
          </p>
          <Win95Button 
            onClick={handleVerify} 
            className="px-4 py-2 font-mono w-full flex items-center justify-center"
            disabled={status === 'verifying'}
          >
            {status === 'verifying' ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ListIcon className="w-4 h-4 mr-2" />
                Verify and Initialize Database
              </>
            )}
          </Win95Button>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400">
          <h3 className="font-mono font-bold mb-2">Required Database Structure</h3>
          <p className="font-mono text-sm mb-2">
            The following nodes are required for the application to function properly:
          </p>
          <ul className="list-disc pl-5 font-mono text-sm">
            <li>toiral</li>
            <li>portfolio</li>
            <li>reviews</li>
            <li>contact</li>
            <li>bookings</li>
            <li>security</li>
            <li>profile</li>
            <li>theme</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
