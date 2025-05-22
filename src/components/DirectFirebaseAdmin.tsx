import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { ref, set, get, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { SaveIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';

export function DirectFirebaseAdmin() {
  const [companyName, setCompanyName] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');
  const [aboutStory, setAboutStory] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load data from Firebase
  useEffect(() => {
    const companyRef = ref(database, 'company');
    const aboutRef = ref(database, 'about');

    const unsubscribeCompany = onValue(companyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCompanyName(data.name || '');
        setCompanyTagline(data.tagline || '');
      }
    });

    const unsubscribeAbout = onValue(aboutRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAboutStory(data.story || '');
      }
    });

    return () => {
      unsubscribeCompany();
      unsubscribeAbout();
    };
  }, []);

  const handleSave = async () => {
    try {
      setStatus('loading');
      setError(null);

      // Update company data
      await set(ref(database, 'company/name'), companyName);
      await set(ref(database, 'company/tagline'), companyTagline);
      
      // Update about data
      await set(ref(database, 'about/story'), aboutStory);

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('Error saving data:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-mono text-xl font-bold mb-4">Direct Firebase Admin</h2>
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Company Information</h3>
          
          <div className="mb-4">
            <label className="block mb-1 font-mono">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border-2 border-gray-400 font-mono"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1 font-mono">Company Tagline</label>
            <input
              type="text"
              value={companyTagline}
              onChange={(e) => setCompanyTagline(e.target.value)}
              className="w-full p-2 border-2 border-gray-400 font-mono"
            />
          </div>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">About Story</h3>
          
          <div className="mb-4">
            <textarea
              value={aboutStory}
              onChange={(e) => setAboutStory(e.target.value)}
              rows={6}
              className="w-full p-2 border-2 border-gray-400 font-mono resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Win95Button 
            onClick={handleSave} 
            className={`px-4 py-2 font-mono flex items-center gap-2 ${
              status === 'loading' ? 'opacity-70' : 
              status === 'success' ? 'bg-green-100' : 
              status === 'error' ? 'bg-red-100' : ''
            }`}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <SaveIcon className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : status === 'success' ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Saved Successfully!
              </>
            ) : status === 'error' ? (
              <>
                <AlertTriangleIcon className="w-4 h-4" />
                Save Failed
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Win95Button>
        </div>
        
        <div className="mt-8 bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
          <h3 className="font-bold mb-2">How This Works</h3>
          <p>This component directly updates the Firebase database without going through the ContentContext.</p>
          <p className="mt-2">If this works but the regular admin panel doesn't, the issue is with how the ContentContext is handling updates.</p>
        </div>
      </div>
    </div>
  );
}
