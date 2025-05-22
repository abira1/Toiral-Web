import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { ShieldIcon, CheckIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

export function DatabaseRulesUpdater() {
  const [status, setStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const developmentRules = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;

  const productionRules = `{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}`;

  const handleUpdateRules = async (rules: string) => {
    setStatus('updating');
    setError(null);
    setSuccess(null);
    
    try {
      // In a real implementation, this would use the Firebase Admin SDK
      // or a cloud function to update the database rules
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      setStatus('success');
      setSuccess(`Database rules updated successfully. Please deploy them using the Firebase CLI: firebase deploy --only database`);
      
      // In a real implementation, you would update the database.rules.json file
      // and then deploy the rules using the Firebase CLI
    } catch (err) {
      console.error('Error updating database rules:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <ShieldIcon className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="font-mono text-xl font-bold">Firebase Database Rules</h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-5 h-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700">
            <div className="flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Development Rules</h3>
          <p className="font-mono text-sm mb-4">
            These rules allow read and write access to everyone. Use these during development.
          </p>
          <div className="bg-gray-100 p-3 border border-gray-300 font-mono text-sm mb-4">
            <pre>{developmentRules}</pre>
          </div>
          <Win95Button 
            onClick={() => handleUpdateRules(developmentRules)} 
            className="px-4 py-2 font-mono w-full flex items-center justify-center"
            disabled={status === 'updating'}
          >
            {status === 'updating' ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Apply Development Rules
              </>
            )}
          </Win95Button>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Production Rules</h3>
          <p className="font-mono text-sm mb-4">
            These rules only allow authenticated users to read and write. Use these in production.
          </p>
          <div className="bg-gray-100 p-3 border border-gray-300 font-mono text-sm mb-4">
            <pre>{productionRules}</pre>
          </div>
          <Win95Button 
            onClick={() => handleUpdateRules(productionRules)} 
            className="px-4 py-2 font-mono w-full flex items-center justify-center"
            disabled={status === 'updating'}
          >
            {status === 'updating' ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Apply Production Rules
              </>
            )}
          </Win95Button>
        </div>
        
        <div className="bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
          <h3 className="font-bold mb-2">Important Note</h3>
          <p>
            This component simulates updating the database rules. In a real implementation, you would need to:
          </p>
          <ol className="list-decimal pl-5 mt-2">
            <li className="mb-1">Update the database.rules.json file</li>
            <li className="mb-1">Deploy the rules using the Firebase CLI: <code>firebase deploy --only database</code></li>
          </ol>
          <p className="mt-2">
            For now, make sure your database.rules.json file has the development rules to allow read and write access.
          </p>
        </div>
      </div>
    </div>
  );
}
