import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { PlusIcon, AlertTriangleIcon, UserPlusIcon, SaveIcon } from 'lucide-react';
import { ref, set, get, push } from 'firebase/database';
import { database } from '../firebase/config';

export function EmergencyTeamMembersManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberImage, setMemberImage] = useState('https://via.placeholder.com/200?text=Team+Member');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTeamMember = async () => {
    if (!memberName || !memberRole) {
      setMessage('Please fill in both name and role fields');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Adding team member...');

      // Get current about data
      const aboutSnapshot = await get(ref(database, 'about'));
      let aboutData = aboutSnapshot.exists() ? aboutSnapshot.val() : { story: 'Our company story...' };
      
      // Create new team member
      const newMember = {
        id: Date.now().toString(),
        name: memberName,
        role: memberRole,
        image: memberImage || 'https://via.placeholder.com/200?text=Team+Member'
      };

      // Update team members array
      if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers)) {
        aboutData.teamMembers = [newMember];
      } else {
        aboutData.teamMembers.push(newMember);
      }

      // Save to Firebase
      await set(ref(database, 'about'), aboutData);
      
      setMessage('Team member added successfully! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error adding team member:', error);
      setMessage('Error adding team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTeamMembers = async () => {
    try {
      setIsLoading(true);
      setMessage('Initializing team members section...');

      // Create default team member
      const defaultMember = {
        id: Date.now().toString(),
        name: 'Team Member',
        role: 'Role',
        image: 'https://via.placeholder.com/200?text=Team+Member'
      };

      // Force set the about section
      await set(ref(database, 'about'), {
        story: 'Our company story...',
        teamMembers: [defaultMember]
      });

      setMessage('Team members section initialized! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error initializing team members:', error);
      setMessage('Error initializing team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-red-100 p-6 border-4 border-red-500 rounded-lg shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-red-700 animate-pulse">
          <AlertTriangleIcon className="inline-block mr-2 h-8 w-8" />
          EMERGENCY: TEAM MEMBERS MANAGER
        </h2>
        <Win95Button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 font-bold"
        >
          {isAdding ? 'Cancel' : 'Add New Team Member'}
        </Win95Button>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>
          {message}
        </div>
      )}

      {isAdding ? (
        <div className="bg-white p-4 border-2 border-gray-300 rounded-lg mb-4">
          <h3 className="text-xl font-bold mb-3">Add New Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold">Name:</label>
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Role:</label>
              <input
                type="text"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter role"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-bold">Image URL:</label>
              <input
                type="text"
                value={memberImage}
                onChange={(e) => setMemberImage(e.target.value)}
                className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter image URL"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Win95Button
                onClick={addTeamMember}
                disabled={isLoading}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 font-bold"
              >
                <SaveIcon className="inline-block mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Team Member'}
              </Win95Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 border-2 border-gray-300 rounded-lg text-center">
            <UserPlusIcon className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-bold mb-2">Add Team Member</h3>
            <p className="mb-4">Add a new team member to your website</p>
            <Win95Button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 font-bold w-full"
            >
              <PlusIcon className="inline-block mr-2 h-4 w-4" />
              Add Team Member
            </Win95Button>
          </div>
          
          <div className="bg-white p-6 border-2 border-gray-300 rounded-lg text-center">
            <AlertTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold mb-2">Initialize Team Members</h3>
            <p className="mb-4">Force initialize the team members section</p>
            <Win95Button
              onClick={initializeTeamMembers}
              disabled={isLoading}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 font-bold w-full"
            >
              <AlertTriangleIcon className="inline-block mr-2 h-4 w-4" />
              Force Initialize
            </Win95Button>
          </div>
        </div>
      )}
    </div>
  );
}
