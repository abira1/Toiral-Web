import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/config';
import { DatabaseIcon, CheckIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

export function DatabaseInitializer() {
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const requiredPaths = [
    'toiral',
    'portfolio',
    'reviews',
    'contact',
    'bookings',
    'security',
    'theme',
    'pricing',
    'contactSubmissions',
    'contactInfo',
    'ads',
    'notifications',
    'socialStats',
    'community'
  ];

  const checkPaths = async () => {
    try {
      setStatus('checking');
      setError(null);

      const pathResults = {};

      for (const path of requiredPaths) {
        try {
          const snapshot = await get(ref(database, path));
          pathResults[path] = {
            exists: snapshot.exists(),
            type: snapshot.exists() ? typeof snapshot.val() : 'undefined',
            isArray: snapshot.exists() ? Array.isArray(snapshot.val()) : false
          };
        } catch (err) {
          pathResults[path] = { error: String(err) };
        }
      }

      setResults(pathResults);
      setStatus('checked');
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  };

  const initializePath = async (path) => {
    try {
      setStatus('initializing');

      // Default value based on path
      let defaultValue = [];

      if (path === 'bookings') {
        defaultValue = [];
      } else if (path === 'contactSubmissions') {
        defaultValue = [];
      } else if (path === 'toiral') {
        defaultValue = {
          name: 'Toiral Web Development',
          tagline: 'Creating Tomorrow\'s Web, Today',
          description: 'We build modern web applications with a retro aesthetic.'
        };
      } else if (path === 'security') {
        defaultValue = {
          adminEmails: ['abirsabirhossain@gmail.com']
        };
      } else if (path === 'theme') {
        defaultValue = {
          primaryColor: '#008080',
          secondaryColor: '#c0c0c0',
          sections: []
        };
      } else if (path === 'pricing') {
        defaultValue = {
          packages: [],
          addons: [],
          currency: '$',
          showPricing: true,
          title: 'Our Pricing Plans',
          subtitle: 'Choose the perfect package for your business needs'
        };
      } else if (path === 'contactInfo') {
        defaultValue = {
          officeHours: 'Monday - Friday: 9AM - 5PM',
          phone: '+1 (555) 123-4567',
          email: 'contact@toiral.com',
          socialMedia: []
        };
      } else if (path === 'ads') {
        defaultValue = {
          ads: []
        };
      } else if (path === 'notifications') {
        defaultValue = {};
      } else if (path === 'socialStats') {
        defaultValue = {
          facebook: 1200,
          twitter: 800,
          instagram: 2500,
          linkedin: 650,
          clients: 50,
          projects: 120
        };
      } else if (path === 'community') {
        defaultValue = {
          categories: {
            category1: {
              name: 'General Discussion',
              description: 'General topics and discussions about our services',
              order: 0
            },
            category2: {
              name: 'Questions & Support',
              description: 'Ask questions and get help from our community',
              order: 1
            },
            category3: {
              name: 'Showcase',
              description: 'Share your projects and get feedback',
              order: 2
            },
            category4: {
              name: 'Suggestions',
              description: 'Suggest new features or improvements',
              order: 3
            }
          },
          topics: {},
          posts: {}
        };
      }

      // Set the default value
      await set(ref(database, path), defaultValue);

      // Refresh the results
      await checkPaths();

      setStatus('initialized');
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  };

  const initializeAllPaths = async () => {
    try {
      setStatus('initializing');

      for (const path of requiredPaths) {
        const snapshot = await get(ref(database, path));
        if (!snapshot.exists()) {
          await initializePath(path);
        }
      }

      await checkPaths();

      setStatus('initialized');
    } catch (err) {
      setError(String(err));
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
        <h2 className="font-mono font-bold text-lg mb-4 flex items-center">
          <DatabaseIcon className="w-5 h-5 mr-2" />
          Database Path Initializer
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            <AlertTriangleIcon className="w-5 h-5 inline-block mr-2" />
            {error}
          </div>
        )}

        <div className="mb-4">
          <div className="flex gap-2 mb-4">
            <Win95Button
              onClick={checkPaths}
              className="px-4 py-2 font-mono"
              disabled={status === 'checking'}
            >
              <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
              {status === 'checking' ? 'Checking...' : 'Check Paths'}
            </Win95Button>

            <Win95Button
              onClick={initializeAllPaths}
              className="px-4 py-2 font-mono"
              disabled={status === 'initializing'}
            >
              <DatabaseIcon className="w-4 h-4 inline-block mr-2" />
              {status === 'initializing' ? 'Initializing...' : 'Initialize All Missing Paths'}
            </Win95Button>
          </div>
        </div>

        {(status === 'checked' || status === 'initialized') && (
          <>
            <h3 className="font-mono font-bold mb-2">Path Status:</h3>
            <div className="space-y-2">
              {Object.entries(results).map(([path, result]) => (
                <div key={path} className="border border-gray-300 p-2 rounded flex justify-between items-center">
                  <span className="font-mono">{path}</span>
                  <div className="flex items-center">
                    {result.exists ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center">
                        <CheckIcon className="w-3 h-3 mr-1" />
                        Exists
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Missing
                        </span>
                        <Win95Button
                          onClick={() => initializePath(path)}
                          className="px-2 py-1 text-xs"
                          disabled={status === 'initializing'}
                        >
                          Initialize
                        </Win95Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
