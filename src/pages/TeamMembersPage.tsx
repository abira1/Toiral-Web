import React, { useState, useEffect } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { database } from '../firebase/config';
import { Win95Button } from '../components/Win95Button';
import { PlusIcon, TrashIcon, SaveIcon, AlertTriangleIcon, ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
          setMessage('Team members loaded successfully');
        } else {
          setTeamMembers([]);
          setMessage('No team members found. You can add some below.');
        }
      } else {
        setTeamMembers([]);
        setMessage('About section not found. You can initialize it below.');
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
      
      setMessage('Team member added successfully');
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
      
      setMessage('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      setError('Failed to remove team member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (id: string, field: keyof TeamMember, value: string) => {
    try {
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
      
      setMessage('Team member updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      setError('Failed to update team member. Please try again.');
    }
  };

  const handleInitializeTeamMembers = async () => {
    if (!window.confirm('Are you sure you want to initialize the team members section? This will create a default team member.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create default team member
      const defaultMember = {
        id: Date.now().toString(),
        name: 'Team Member',
        role: 'Role',
        image: 'https://via.placeholder.com/200?text=Team+Member'
      };
      
      // Get current about data
      const snapshot = await get(ref(database, 'about'));
      let aboutData = snapshot.exists() ? snapshot.val() : { story: 'Our company story...' };
      
      // Set team members array
      aboutData.teamMembers = [defaultMember];
      
      // Save to Firebase
      await set(ref(database, 'about'), aboutData);
      
      // Update local state
      setTeamMembers(aboutData.teamMembers);
      
      setMessage('Team members section initialized successfully');
    } catch (error) {
      console.error('Error initializing team members:', error);
      setError('Failed to initialize team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetTeamMembers = async () => {
    if (!window.confirm('Are you sure you want to reset the team members section? This will remove all team members.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get current about data
      const snapshot = await get(ref(database, 'about'));
      if (!snapshot.exists()) {
        setError('About section not found');
        return;
      }
      
      const aboutData = snapshot.val();
      
      // Remove team members array
      delete aboutData.teamMembers;
      
      // Save to Firebase
      await set(ref(database, 'about'), aboutData);
      
      // Update local state
      setTeamMembers([]);
      
      setMessage('Team members section reset successfully');
    } catch (error) {
      console.error('Error resetting team members:', error);
      setError('Failed to reset team members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Team Members Manager</h1>
          <Link to="/admin">
            <Win95Button className="px-4 py-2">
              <ArrowLeftIcon className="w-4 h-4 inline-block mr-2" />
              Back to Admin Panel
            </Win95Button>
          </Link>
        </div>
        
        {message && (
          <div className="bg-green-100 border-2 border-green-400 text-green-700 p-3 mb-4 rounded">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}
        
        <div className="bg-red-100 border-2 border-red-400 p-4 mb-6 rounded">
          <h2 className="text-xl font-bold text-red-700 mb-2">Emergency Actions</h2>
          <div className="flex gap-4">
            <Win95Button 
              onClick={handleInitializeTeamMembers}
              disabled={isLoading}
              className="px-4 py-2 bg-green-100 hover:bg-green-200"
            >
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              Initialize Team Members
            </Win95Button>
            
            <Win95Button 
              onClick={handleResetTeamMembers}
              disabled={isLoading}
              className="px-4 py-2 bg-red-100 hover:bg-red-200"
            >
              <AlertTriangleIcon className="w-4 h-4 inline-block mr-2" />
              Reset Team Members
            </Win95Button>
            
            <Win95Button 
              onClick={loadTeamMembers}
              disabled={isLoading}
              className="px-4 py-2"
            >
              Refresh
            </Win95Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white border-2 border-gray-400 p-6 mb-6 rounded">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Add New Team Member</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-bold">Name:</label>
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-bold">Role:</label>
            <input
              type="text"
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter role"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block mb-1 font-bold">Image URL:</label>
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
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200"
        >
          <PlusIcon className="w-4 h-4 inline-block mr-2" />
          Add Team Member
        </Win95Button>
      </div>
      
      <div className="bg-white border-2 border-gray-400 p-6 rounded">
        <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">Current Team Members</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading team members...</p>
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden">
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
                  <input
                    type="text"
                    value={member.name || ''}
                    onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                    className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Member Name"
                  />
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                    className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Role"
                  />
                  <input
                    type="url"
                    value={member.image || ''}
                    onChange={(e) => handleUpdateMember(member.id, 'image', e.target.value)}
                    className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Image URL"
                  />
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
          <div className="text-center py-8 bg-gray-50 border-2 border-gray-400 rounded">
            <p className="mb-4">No team members found. Add your first team member above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
