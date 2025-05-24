import React, { useState, useEffect } from 'react';
import { testFirebaseConnection, testFirebaseWrite } from '../firebase/testConnection';
import { Win95Button } from './Win95Button';
import { firebaseConfig } from '../firebase/config';

export function FirebaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'testing' | 'success' | 'failure'>('untested');
  const [writeStatus, setWriteStatus] = useState<'untested' | 'testing' | 'success' | 'failure'>('untested');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configDetails, setConfigDetails] = useState<string | null>(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage(null);
    
    try {
      const success = await testFirebaseConnection();
      setConnectionStatus(success ? 'success' : 'failure');
      
      if (!success) {
        setErrorMessage('Failed to connect to Firebase. Check console for details.');
      }
    } catch (error) {
      setConnectionStatus('failure');
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Connection test error:', error);
    }
  };

  const testWrite = async () => {
    setWriteStatus('testing');
    setErrorMessage(null);
    
    try {
      const success = await testFirebaseWrite();
      setWriteStatus(success ? 'success' : 'failure');
      
      if (!success) {
        setErrorMessage('Failed to write to Firebase. Check console for details.');
      }
    } catch (error) {
      setWriteStatus('failure');
      setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Write test error:', error);
    }
  };

  useEffect(() => {
    // Display the current Firebase configuration
    setConfigDetails(`
      Database URL: ${firebaseConfig.databaseURL}
      Project ID: ${firebaseConfig.projectId}
      Auth Domain: ${firebaseConfig.authDomain}
    `);
  }, []);

  return (
    <div className="p-6 bg-gray-200 border-2 border-gray-400 max-w-2xl mx-auto my-4">
      <h2 className="font-mono font-bold text-xl mb-4">Firebase Connection Test</h2>
      
      {configDetails && (
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Current Configuration</h3>
          <pre className="font-mono text-sm whitespace-pre-wrap">{configDetails}</pre>
        </div>
      )}
      
      <div className="flex gap-4 mb-4">
        <Win95Button 
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className="px-4 py-2 font-mono"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
        </Win95Button>
        
        <Win95Button 
          onClick={testWrite}
          disabled={writeStatus === 'testing' || connectionStatus !== 'success'}
          className="px-4 py-2 font-mono"
        >
          {writeStatus === 'testing' ? 'Testing...' : 'Test Write'}
        </Win95Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono">Connection Status:</span>
          {connectionStatus === 'untested' && <span className="font-mono text-gray-500">Not tested</span>}
          {connectionStatus === 'testing' && <span className="font-mono text-blue-500">Testing...</span>}
          {connectionStatus === 'success' && <span className="font-mono text-green-500">Connected</span>}
          {connectionStatus === 'failure' && <span className="font-mono text-red-500">Failed</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono">Write Status:</span>
          {writeStatus === 'untested' && <span className="font-mono text-gray-500">Not tested</span>}
          {writeStatus === 'testing' && <span className="font-mono text-blue-500">Testing...</span>}
          {writeStatus === 'success' && <span className="font-mono text-green-500">Success</span>}
          {writeStatus === 'failure' && <span className="font-mono text-red-500">Failed</span>}
        </div>
      </div>
      
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 text-red-700 font-mono text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
