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
    <div
      className="bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden"
      style={{
        borderStyle: 'outset',
        borderWidth: '2px',
        boxShadow: 'inset -1px -1px 0px rgba(0,0,0,0.25), inset 1px 1px 0px rgba(255,255,255,0.75)'
      }}
    >
      {/* Header with Windows 95 styling */}
      <div className="bg-gray-200 border-b-2 border-gray-400 p-4 flex items-center justify-between">
        <h3 className="font-mono font-bold text-xl text-black">
          Team Members Manager
        </h3>
        <Win95Button
          onClick={loadTeamMembers}
          disabled={isLoading}
          className="px-4 py-2 font-mono"
          title="Refresh team members list"
        >
          <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
          Refresh
        </Win95Button>
      </div>

      {/* Content area */}
      <div className="p-6">

        {error && (
          <div
            className="bg-white border-2 border-gray-600 text-red-700 p-3 mb-4 font-mono"
            style={{
              borderStyle: 'inset',
              borderTopColor: '#808080',
              borderLeftColor: '#808080',
              borderBottomColor: '#ffffff',
              borderRightColor: '#ffffff'
            }}
          >
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div
            className="bg-white border-2 border-gray-600 text-green-700 p-3 mb-4 font-mono"
            style={{
              borderStyle: 'inset',
              borderTopColor: '#808080',
              borderLeftColor: '#808080',
              borderBottomColor: '#ffffff',
              borderRightColor: '#ffffff'
            }}
          >
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              {success}
            </div>
          </div>
        )}

        {/* Add New Team Member Form */}
        <div
          className="mb-6 p-4 bg-white border-2 border-gray-400 rounded-lg"
          style={{
            borderStyle: 'inset',
            borderTopColor: '#808080',
            borderLeftColor: '#808080',
            borderBottomColor: '#ffffff',
            borderRightColor: '#ffffff'
          }}
        >
          <h4 className="font-mono font-bold text-lg mb-3 text-black">Add New Team Member</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-mono text-sm font-bold text-black">Name</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                style={{
                  borderStyle: 'inset',
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderBottomColor: '#ffffff',
                  borderRightColor: '#ffffff'
                }}
                placeholder="Enter member name"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono text-sm font-bold text-black">Role</label>
              <input
                type="text"
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                style={{
                  borderStyle: 'inset',
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderBottomColor: '#ffffff',
                  borderRightColor: '#ffffff'
                }}
                placeholder="Enter member role"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 font-mono text-sm font-bold text-black">Image URL</label>
              <input
                type="url"
                value={newMember.image}
                onChange={(e) => setNewMember({...newMember, image: e.target.value})}
                className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                style={{
                  borderStyle: 'inset',
                  borderTopColor: '#808080',
                  borderLeftColor: '#808080',
                  borderBottomColor: '#ffffff',
                  borderRightColor: '#ffffff'
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <Win95Button
            onClick={handleAddMember}
            disabled={isLoading}
            className="px-4 py-2 font-mono w-full"
            title="Add new team member"
          >
            <PlusIcon className="w-4 h-4 inline-block mr-2" />
            Add Team Member
          </Win95Button>
        </div>

        {/* Team Members List */}
        <div>
          <h4 className="font-mono font-bold text-lg mb-3 border-b-2 border-gray-400 pb-2 text-black">Current Team Members</h4>

          {isLoading ? (
            <div
              className="text-center py-8 bg-white border-2 border-gray-400"
              style={{
                borderStyle: 'inset',
                borderTopColor: '#808080',
                borderLeftColor: '#808080',
                borderBottomColor: '#ffffff',
                borderRightColor: '#ffffff'
              }}
            >
              <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-mono text-black">Loading team members...</p>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden"
                  style={{
                    borderStyle: 'outset',
                    borderWidth: '2px',
                    boxShadow: 'inset -1px -1px 0px rgba(0,0,0,0.25), inset 1px 1px 0px rgba(255,255,255,0.75)'
                  }}
                >
                  <div className="aspect-square relative border-b-2 border-gray-400">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23C0C0C0%22%20width%3D%22200%22%20height%3D%22200%22%20stroke%3D%22%23808080%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20fill%3D%22%23000000%22%20font-family%3D%22monospace%22%20font-size%3D%2214%22%20x%3D%22100%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ETeam%20Member%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block mb-1 font-mono text-sm font-bold text-black">Name</label>
                      <input
                        type="text"
                        value={member.name || ''}
                        onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                        className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                        style={{
                          borderStyle: 'inset',
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderBottomColor: '#ffffff',
                          borderRightColor: '#ffffff'
                        }}
                        placeholder="Member Name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-mono text-sm font-bold text-black">Role</label>
                      <input
                        type="text"
                        value={member.role || ''}
                        onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                        className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                        style={{
                          borderStyle: 'inset',
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderBottomColor: '#ffffff',
                          borderRightColor: '#ffffff'
                        }}
                        placeholder="Role"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-mono text-sm font-bold text-black">Image URL</label>
                      <input
                        type="url"
                        value={member.image || ''}
                        onChange={(e) => handleUpdateMember(member.id, 'image', e.target.value)}
                        className="w-full p-2 border-2 border-gray-600 bg-white font-mono"
                        style={{
                          borderStyle: 'inset',
                          borderTopColor: '#808080',
                          borderLeftColor: '#808080',
                          borderBottomColor: '#ffffff',
                          borderRightColor: '#ffffff'
                        }}
                        placeholder="Image URL"
                      />
                    </div>
                    <Win95Button
                      onClick={() => handleRemoveMember(member.id)}
                      className="w-full p-2 font-mono text-red-600"
                      title="Remove team member"
                    >
                      <TrashIcon className="w-4 h-4 inline-block mr-2" />
                      Remove
                    </Win95Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8 bg-white border-2 border-gray-400 rounded-lg"
              style={{
                borderStyle: 'inset',
                borderTopColor: '#808080',
                borderLeftColor: '#808080',
                borderBottomColor: '#ffffff',
                borderRightColor: '#ffffff'
              }}
            >
              <p className="font-mono text-black mb-4">No team members yet. Add your first team member using the form above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
