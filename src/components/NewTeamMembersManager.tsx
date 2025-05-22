import React, { useState, useEffect } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { database } from '../firebase/config';
import { Win95Button } from './Win95Button';
import { PlusIcon, TrashIcon, RefreshCwIcon } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export function NewTeamMembersManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<TeamMember>({
    id: Date.now().toString(),
    name: '',
    role: '',
    image: 'https://via.placeholder.com/200?text=Team+Member'
  });

  // Load team members on component mount
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const snapshot = await get(ref(database, 'about'));
      
      if (snapshot.exists()) {
        const aboutData = snapshot.val();
        console.log('About data from Firebase:', aboutData);
        
        if (aboutData.teamMembers && Array.isArray(aboutData.teamMembers)) {
          setTeamMembers(aboutData.teamMembers);
          setSuccess('Team members loaded successfully');
        } else {
          setTeamMembers([]);
          setSuccess('No team members found. You can add some below.');
        }
      } else {
        setTeamMembers([]);
        setSuccess('About section not found. You can initialize it below.');
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setError('Failed to load team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) {
      setError('Please fill in both name and role fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new team member with a unique ID
      const memberToAdd = {
        ...newMember,
        id: Date.now().toString()
      };
      
      // Get current about data
      const snapshot = await get(ref(database, 'about'));
      let aboutData = snapshot.exists() ? snapshot.val() : { story: 'Our company story...' };
      
      // Update team members array
      if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers)) {
        aboutData.teamMembers = [memberToAdd];
      } else {
        aboutData.teamMembers.push(memberToAdd);
      }
      
      // Save to Firebase
      await set(ref(database, 'about'), aboutData);
      
      // Update local state
      setTeamMembers(aboutData.teamMembers);
      
      // Reset form
      setNewMember({
        id: Date.now().toString(),
        name: '',
        role: '',
        image: 'https://via.placeholder.com/200?text=Team+Member'
      });
      
      setSuccess('Team member added successfully');
    } catch (error) {
      console.error('Error adding team member:', error);
      setError('Failed to add team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current about data
      const snapshot = await get(ref(database, 'about'));
      if (!snapshot.exists()) {
        setError('About section not found');
        return;
      }
      
      const aboutData = snapshot.val();
      
      // Remove team member from array
      if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers)) {
        setError('No team members found');
        return;
      }
      
      aboutData.teamMembers = aboutData.teamMembers.filter((member: TeamMember) => member.id !== id);
      
      // Save to Firebase
      await set(ref(database, 'about'), aboutData);
      
      // Update local state
      setTeamMembers(aboutData.teamMembers);
      
      setSuccess('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      setError('Failed to remove team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (id: string, field: keyof TeamMember, value: string) => {
    try {
      setError(null);
      
      // Update in local state first for immediate feedback
      const updatedMembers = teamMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      );
      setTeamMembers(updatedMembers);
      
      // Get current about data
      const snapshot = await get(ref(database, 'about'));
      if (!snapshot.exists()) {
        setError('About section not found');
        return;
      }
      
      const aboutData = snapshot.val();
      
      // Update team member in array
      if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers)) {
        setError('No team members found');
        return;
      }
      
      aboutData.teamMembers = updatedMembers;
      
      // Save to Firebase
      await set(ref(database, 'about'), aboutData);
      
      setSuccess('Team member updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating team member:', error);
      setError('Failed to update team member. Please try again.');
    }
  };

  return (
    <div className="bg-red-100 p-6 border-4 border-red-500 rounded-lg">
      <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2">
        <h3 className="font-mono font-bold text-xl">
          COMPLETELY NEW TEAM MEMBERS MANAGER
          <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded animate-pulse">NEW VERSION</span>
        </h3>
        <Win95Button
          onClick={loadTeamMembers}
          disabled={isLoading}
          className="px-4 py-2 font-mono"
        >
          <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
          Refresh
        </Win95Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-2 border-green-400 text-green-700 p-3 mb-4 rounded">
          {success}
        </div>
      )}
      
      {/* Add New Team Member Form */}
      <div className="mb-6 p-4 bg-white border-2 border-gray-300 rounded-lg">
        <h4 className="font-mono font-bold text-lg mb-3">Add New Team Member</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-mono text-gray-600">Name</label>
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-mono text-gray-600">Role</label>
            <input
              type="text"
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter role"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-1 font-mono text-gray-600">Image URL</label>
            <input
              type="text"
              value={newMember.image}
              onChange={(e) => setNewMember({...newMember, image: e.target.value})}
              className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter image URL"
            />
          </div>
        </div>
        
        <Win95Button
          onClick={handleAddMember}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 w-full text-lg font-bold"
        >
          <PlusIcon className="w-5 h-5 inline-block mr-2" />
          ADD NEW TEAM MEMBER
        </Win95Button>
      </div>
      
      {/* Team Members List */}
      <div>
        <h4 className="font-mono font-bold text-lg mb-3 border-b-2 border-gray-200 pb-2">Current Team Members</h4>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading team members...</p>
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white border-2 border-gray-400 rounded-lg overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200?text=Team+Member';
                    }}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <label className="block mb-1 font-mono text-gray-600 text-sm">Name</label>
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                      className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                      placeholder="Member Name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-mono text-gray-600 text-sm">Role</label>
                    <input
                      type="text"
                      value={member.role || ''}
                      onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                      className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                      placeholder="Role"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-mono text-gray-600 text-sm">Image URL</label>
                    <input
                      type="url"
                      value={member.image || ''}
                      onChange={(e) => handleUpdateMember(member.id, 'image', e.target.value)}
                      className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                      placeholder="Image URL"
                    />
                  </div>
                  <Win95Button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-full p-2 text-red-600 border-2 border-gray-600"
                  >
                    <TrashIcon className="w-4 h-4 inline-block mr-2" />
                    Remove
                  </Win95Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white border-2 border-gray-300 rounded-lg">
            <p className="font-mono text-gray-600 mb-4">No team members yet. Add your first team member using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
