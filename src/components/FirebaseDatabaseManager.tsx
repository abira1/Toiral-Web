import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { initializeDatabase, resetDatabaseSection, resetEntireDatabase } from '../firebase/initializeDatabase';
import { DatabaseIcon, RefreshCwIcon, AlertTriangleIcon, CheckIcon } from 'lucide-react';

export function FirebaseDatabaseManager() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');

  const handleInitializeDatabase = async () => {
    if (!window.confirm('Are you sure you want to initialize the database? This will set up the database with default data.')) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const success = await initializeDatabase();
      if (success) {
        setMessage({ text: 'Database initialized successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to initialize database.', type: 'error' });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setMessage({ text: 'An error occurred while initializing the database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSection = async () => {
    if (!selectedSection) {
      setMessage({ text: 'Please select a section to reset.', type: 'info' });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to reset the ${selectedSection} section? This will delete all existing data in this section and replace it with default values.`)) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const success = await resetDatabaseSection(selectedSection);
      if (success) {
        setMessage({ text: `${selectedSection} section reset successfully!`, type: 'success' });
      } else {
        setMessage({ text: `Failed to reset ${selectedSection} section.`, type: 'error' });
      }
    } catch (error) {
      console.error(`Error resetting ${selectedSection} section:`, error);
      setMessage({ text: `An error occurred while resetting the ${selectedSection} section.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetEntireDatabase = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to reset the ENTIRE database? This will delete ALL existing data and replace it with default values. This action cannot be undone!')) {
      return;
    }
    
    // Double confirmation for such a destructive action
    if (!window.confirm('FINAL WARNING: This will delete ALL your data. Are you sure you want to proceed?')) {
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const success = await resetEntireDatabase();
      if (success) {
        setMessage({ text: 'Entire database reset successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to reset database.', type: 'error' });
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      setMessage({ text: 'An error occurred while resetting the database.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <DatabaseIcon className="w-6 h-6 mr-2 text-blue-600" />
          <h2 className="font-mono text-xl font-bold">Firebase Database Management</h2>
        </div>
        
        {message && (
          <div className={`mb-4 p-3 border-2 font-mono ${
            message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 
            message.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 
            'bg-blue-100 border-blue-500 text-blue-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' && <CheckIcon className="w-5 h-5 mr-2" />}
              {message.type === 'error' && <AlertTriangleIcon className="w-5 h-5 mr-2" />}
              {message.type === 'info' && <RefreshCwIcon className="w-5 h-5 mr-2" />}
              <p>{message.text}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Initialize Database</h3>
          <p className="font-mono text-sm mb-4">
            This will set up the database with default data if it doesn't exist yet.
            It's safe to run this if you're setting up a new project.
          </p>
          <Win95Button 
            onClick={handleInitializeDatabase} 
            className="px-4 py-2 font-mono"
            disabled={loading}
          >
            {loading ? 'Initializing...' : 'Initialize Database'}
          </Win95Button>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2">Reset Section</h3>
          <p className="font-mono text-sm mb-4">
            This will reset a specific section of the database to default values.
            All existing data in the selected section will be lost.
          </p>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
              className="flex-1 p-2 border-2 border-gray-400 font-mono"
            >
              <option value="">Select a section</option>
              <option value="company">Company</option>
              <option value="about">About</option>
              <option value="portfolio">Portfolio</option>
              <option value="reviews">Reviews</option>
              <option value="contact">Contact</option>
              <option value="services">Services</option>
              <option value="bookings">Bookings</option>
              <option value="contactSubmissions">Contact Submissions</option>
              <option value="chatMessages">Chat Messages</option>
            </select>
            <Win95Button 
              onClick={handleResetSection} 
              className="px-4 py-2 font-mono"
              disabled={loading || !selectedSection}
            >
              {loading ? 'Resetting...' : 'Reset Section'}
            </Win95Button>
          </div>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 mb-4">
          <h3 className="font-mono font-bold mb-2 text-red-600">Reset Entire Database</h3>
          <p className="font-mono text-sm mb-4 text-red-600">
            WARNING: This will reset the ENTIRE database to default values.
            ALL existing data will be lost. This action cannot be undone!
          </p>
          <Win95Button 
            onClick={handleResetEntireDatabase} 
            className="px-4 py-2 font-mono bg-red-100 hover:bg-red-200"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Entire Database'}
          </Win95Button>
        </div>
      </div>
    </div>
  );
}
