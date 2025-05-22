import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export function SimpleTeamMembersManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load team members on component mount
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        const snapshot = await get(ref(database, 'about'));
        
        if (snapshot.exists()) {
          const aboutData = snapshot.val();
          if (aboutData.teamMembers && Array.isArray(aboutData.teamMembers)) {
            setTeamMembers(aboutData.teamMembers);
          } else {
            // Initialize with a default team member if none exist
            const defaultMember = {
              id: Date.now().toString(),
              name: 'New Team Member',
              role: 'Role',
              image: 'https://via.placeholder.com/200?text=Team+Member'
            };
            setTeamMembers([defaultMember]);
            
            // Save the default member to Firebase
            await set(ref(database, 'about'), {
              ...aboutData,
              teamMembers: [defaultMember]
            });
          }
        } else {
          // Create the about section if it doesn't exist
          const defaultMember = {
            id: Date.now().toString(),
            name: 'New Team Member',
            role: 'Role',
            image: 'https://via.placeholder.com/200?text=Team+Member'
          };
          setTeamMembers([defaultMember]);
          
          // Save the default member to Firebase
          await set(ref(database, 'about'), {
            story: 'Our company story...',
            teamMembers: [defaultMember]
          });
        }
      } catch (error) {
        console.error('Error loading team members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeamMembers();
  }, []);

  const handleAddMember = async () => {
    try {
      setIsSaving(true);
      
      // Create a new team member
      const newMember = {
        id: Date.now().toString(),
        name: 'New Team Member',
        role: 'Role',
        image: 'https://via.placeholder.com/200?text=Team+Member'
      };
      
      // Add to local state
      const updatedMembers = [...teamMembers, newMember];
      setTeamMembers(updatedMembers);
      
      // Save to Firebase
      const snapshot = await get(ref(database, 'about'));
      if (snapshot.exists()) {
        const aboutData = snapshot.val();
        await set(ref(database, 'about'), {
          ...aboutData,
          teamMembers: updatedMembers
        });
      } else {
        await set(ref(database, 'about'), {
          story: 'Our company story...',
          teamMembers: updatedMembers
        });
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      setIsSaving(true);
      
      // Remove from local state
      const updatedMembers = teamMembers.filter(member => member.id !== id);
      setTeamMembers(updatedMembers);
      
      // Save to Firebase
      const snapshot = await get(ref(database, 'about'));
      if (snapshot.exists()) {
        const aboutData = snapshot.val();
        await set(ref(database, 'about'), {
          ...aboutData,
          teamMembers: updatedMembers
        });
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMember = async (id: string, field: keyof TeamMember, value: string) => {
    try {
      setIsSaving(true);
      
      // Update in local state
      const updatedMembers = teamMembers.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      );
      setTeamMembers(updatedMembers);
      
      // Save to Firebase (debounced)
      const saveToFirebase = async () => {
        const snapshot = await get(ref(database, 'about'));
        if (snapshot.exists()) {
          const aboutData = snapshot.val();
          await set(ref(database, 'about'), {
            ...aboutData,
            teamMembers: updatedMembers
          });
        }
      };
      
      // Use a timeout to debounce the save
      const timeoutId = setTimeout(saveToFirebase, 500);
      
      // Clean up the timeout
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error updating team member:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 border-2 border-blue-500 rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border-2 border-blue-500 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2 bg-blue-100 p-3 rounded-t">
        <h3 className="font-mono font-bold text-xl text-blue-700">
          TEAM MEMBERS MANAGEMENT
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-sm rounded">ACTIVE</span>
        </h3>
        <Win95Button
          onClick={handleAddMember}
          disabled={isSaving}
          className="px-4 py-2 font-mono bg-green-100 hover:bg-green-200"
        >
          <PlusIcon className="w-4 h-4 inline-block mr-2" />
          Add Member
        </Win95Button>
      </div>

      {/* Standalone Add Team Member Button */}
      <div className="mb-4">
        <Win95Button
          onClick={handleAddMember}
          disabled={isSaving}
          className="px-4 py-2 font-mono bg-green-100 hover:bg-green-200 w-full text-lg font-bold border-4 border-green-300"
        >
          <PlusIcon className="w-6 h-6 inline-block mr-2" />
          ADD NEW TEAM MEMBER
        </Win95Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.length > 0 ? (
          teamMembers.map(member => (
            <div key={member.id} className="bg-gray-50 border-2 border-gray-400 rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src = 'https://via.placeholder.com/200?text=Team+Member';
                  }}
                />
              </div>
              <div className="p-4 space-y-2">
                <input
                  type="text"
                  value={member.name || ''}
                  onChange={e => handleUpdateMember(member.id, 'name', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Member Name"
                />
                <input
                  type="text"
                  value={member.role || ''}
                  onChange={e => handleUpdateMember(member.id, 'role', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Role"
                />
                <input
                  type="url"
                  value={member.image || ''}
                  onChange={e => handleUpdateMember(member.id, 'image', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Image URL"
                />
                <Win95Button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={isSaving}
                  className="w-full p-2 text-red-600 border-2 border-gray-600"
                >
                  <TrashIcon className="w-4 h-4 inline-block mr-2" />
                  Remove
                </Win95Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 bg-green-50 border-4 border-green-400 rounded-lg shadow-lg">
            <p className="font-mono text-green-600 mb-4 text-xl font-bold">No team members yet. Add your first team member!</p>
            <Win95Button 
              onClick={handleAddMember}
              disabled={isSaving}
              className="px-6 py-3 font-mono mx-auto bg-green-100 hover:bg-green-200 text-lg font-bold"
            >
              <PlusIcon className="w-6 h-6 inline-block mr-2" />
              Add Your First Team Member
            </Win95Button>
          </div>
        )}
      </div>
    </div>
  );
}
