import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { PlusIcon, AlertTriangleIcon } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { database } from '../firebase/config';

export function TeamMembersInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeTeamMembers = async () => {
    try {
      setIsInitializing(true);
      
      // Create a default team member
      const defaultTeamMember = {
        id: Date.now().toString(),
        name: 'Team Member',
        role: 'Role',
        image: 'https://via.placeholder.com/200?text=Team+Member'
      };
      
      // Force set the about section with a team member
      await set(ref(database, 'about'), {
        story: 'Our company story...',
        teamMembers: [defaultTeamMember]
      });
      
      alert('Team Members section has been initialized! Refreshing the page...');
      window.location.reload();
    } catch (error) {
      console.error('Error initializing team members:', error);
      alert('Failed to initialize Team Members section. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-white p-6 border-4 border-red-500 rounded-lg shadow-lg mb-6">
      <div className="text-center py-4">
        <AlertTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h3 className="font-mono font-bold text-2xl text-red-600 mb-4">Team Members Section Missing</h3>
        <p className="font-mono text-gray-600 mb-6 text-lg">
          The Team Members section is not visible. Click the button below to initialize it.
        </p>
        <Win95Button
          onClick={initializeTeamMembers}
          disabled={isInitializing}
          className={`px-6 py-3 font-mono bg-red-100 hover:bg-red-200 mx-auto text-lg font-bold border-4 border-red-300 ${isInitializing ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`}
        >
          <PlusIcon className={`w-6 h-6 inline-block mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
          {isInitializing ? 'INITIALIZING...' : 'INITIALIZE TEAM MEMBERS NOW'}
        </Win95Button>
      </div>
    </div>
  );
}
