import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { ref, get, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { TeamMember } from '../../types';
import {
  PlusIcon,
  TrashIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckIcon,
  FilterIcon,
  SortAscIcon,
  SearchIcon,
  UsersIcon,
  EditIcon,
  SaveIcon,
  UserIcon,
  GridIcon,
  ListIcon
} from 'lucide-react';

export function EnhancedTeamMembersManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'date'>('name');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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

  // Filter and sort team members
  const filteredAndSortedMembers = React.useMemo(() => {
    let filtered = teamMembers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'role':
          return a.role.localeCompare(b.role);
        case 'date':
          return parseInt(b.id) - parseInt(a.id); // Newer first
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [teamMembers, searchTerm, sortBy]);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const snapshot = await get(ref(database, 'about'));

      if (snapshot.exists()) {
        const aboutData = snapshot.val();

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

      setShowAddForm(false);
      setSuccess('Team member added successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
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
      setTimeout(() => setSuccess(null), 3000);
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating team member:', error);
      setError('Failed to update team member. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border-2 border-gray-400">
        <h3 className="font-mono font-bold text-xl mb-4 border-b-2 border-gray-200 pb-2">
          Team Members Manager
        </h3>

        {/* Filter and Search Controls */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-100 border-2 border-gray-300">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-4 h-4" />
            <label className="font-mono text-sm font-bold">Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or role..."
              className="px-2 py-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <SortAscIcon className="w-4 h-4" />
            <label className="font-mono text-sm font-bold">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
            >
              <option value="name">Name (A-Z)</option>
              <option value="role">Role</option>
              <option value="date">Date Added (Newest First)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-mono text-sm font-bold">View:</label>
            <Win95Button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 font-mono ${viewMode === 'list' ? 'bg-blue-100' : ''}`}
            >
              <ListIcon className="w-4 h-4" />
            </Win95Button>
            <Win95Button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 font-mono ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}
            >
              <GridIcon className="w-4 h-4" />
            </Win95Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Win95Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 font-mono"
            >
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              {showAddForm ? 'Cancel' : 'Add Member'}
            </Win95Button>

            <Win95Button
              onClick={loadTeamMembers}
              disabled={isLoading}
              className="px-4 py-2 font-mono"
            >
              <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
              Refresh
            </Win95Button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="font-mono text-sm text-gray-600">
              Showing {filteredAndSortedMembers.length} of {teamMembers.length} team members
            </span>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 border-2 border-red-400 bg-red-50 text-red-800 font-mono text-sm">
            <div className="flex items-center">
              <AlertTriangleIcon className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 border-2 border-green-400 bg-green-50 text-green-800 font-mono text-sm">
            <div className="flex items-center">
              <CheckIcon className="w-4 h-4 mr-2" />
              {success}
            </div>
          </div>
        )}

        {/* Add New Team Member Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-white border-2 border-gray-400">
            <h4 className="font-mono font-bold text-lg mb-4 border-b-2 border-gray-200 pb-2">
              Add New Team Member
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-mono text-sm font-bold">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono text-sm font-bold">Role</label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                  placeholder="Enter member role"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-1 font-mono text-sm font-bold">Image URL</label>
                <input
                  type="url"
                  value={newMember.image}
                  onChange={(e) => setNewMember({...newMember, image: e.target.value})}
                  className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Win95Button
                onClick={handleAddMember}
                disabled={isLoading}
                className="px-4 py-2 font-mono"
              >
                <PlusIcon className="w-4 h-4 inline-block mr-2" />
                Add Team Member
              </Win95Button>

              <Win95Button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 font-mono"
              >
                Cancel
              </Win95Button>
            </div>
          </div>
        )}

        {/* Team Members List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-8 bg-white border-2 border-gray-400 text-center">
              <div className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-mono text-gray-600">Loading team members...</p>
            </div>
          ) : filteredAndSortedMembers.length > 0 ? (
            viewMode === 'list' ? (
              // List View
              filteredAndSortedMembers.map((member) => (
                <div key={member.id} className="p-4 bg-white border-2 border-gray-400">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Member Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover border-2 border-gray-400"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23C0C0C0%22%20width%3D%22200%22%20height%3D%22200%22%20stroke%3D%22%23808080%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20fill%3D%22%23000000%22%20font-family%3D%22monospace%22%20font-size%3D%2214%22%20x%3D%22100%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ETeam%20Member%3C%2Ftext%3E%3C%2Fsvg%3E';
                        }}
                      />
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 space-y-3">
                      {editingMember === member.id ? (
                        // Edit Mode
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 font-mono text-sm font-bold">Name</label>
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                              className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-mono text-sm font-bold">Role</label>
                            <input
                              type="text"
                              value={member.role || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                              className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block mb-1 font-mono text-sm font-bold">Image URL</label>
                            <input
                              type="url"
                              value={member.image || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'image', e.target.value)}
                              className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                            />
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <h4 className="font-mono font-bold text-lg">{member.name}</h4>
                          <p className="font-mono text-gray-600">{member.role}</p>
                          <p className="font-mono text-sm text-gray-500 mt-2">
                            Image: {member.image}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {editingMember === member.id ? (
                          <Win95Button
                            onClick={() => setEditingMember(null)}
                            className="px-4 py-2 font-mono"
                          >
                            <SaveIcon className="w-4 h-4 inline-block mr-2" />
                            Done Editing
                          </Win95Button>
                        ) : (
                          <Win95Button
                            onClick={() => setEditingMember(member.id)}
                            className="px-4 py-2 font-mono"
                          >
                            <EditIcon className="w-4 h-4 inline-block mr-2" />
                            Edit
                          </Win95Button>
                        )}

                        <Win95Button
                          onClick={() => handleRemoveMember(member.id)}
                          className="px-4 py-2 font-mono text-red-600"
                        >
                          <TrashIcon className="w-4 h-4 inline-block mr-2" />
                          Remove
                        </Win95Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedMembers.map((member) => (
                  <div key={member.id} className="bg-white border-2 border-gray-400 overflow-hidden">
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
                      {editingMember === member.id ? (
                        // Edit Mode
                        <div className="space-y-3">
                          <div>
                            <label className="block mb-1 font-mono text-sm font-bold">Name</label>
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                              className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-mono text-sm font-bold">Role</label>
                            <input
                              type="text"
                              value={member.role || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                              className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-mono text-sm font-bold">Image URL</label>
                            <input
                              type="url"
                              value={member.image || ''}
                              onChange={(e) => handleUpdateMember(member.id, 'image', e.target.value)}
                              className="w-full p-2 border-2 border-gray-600 bg-white font-mono border-t-gray-800 border-l-gray-800"
                            />
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div>
                          <h4 className="font-mono font-bold text-lg">{member.name}</h4>
                          <p className="font-mono text-gray-600">{member.role}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {editingMember === member.id ? (
                          <Win95Button
                            onClick={() => setEditingMember(null)}
                            className="flex-1 p-2 font-mono"
                          >
                            <SaveIcon className="w-4 h-4 inline-block mr-2" />
                            Done
                          </Win95Button>
                        ) : (
                          <Win95Button
                            onClick={() => setEditingMember(member.id)}
                            className="flex-1 p-2 font-mono"
                          >
                            <EditIcon className="w-4 h-4 inline-block mr-2" />
                            Edit
                          </Win95Button>
                        )}

                        <Win95Button
                          onClick={() => handleRemoveMember(member.id)}
                          className="flex-1 p-2 font-mono text-red-600"
                        >
                          <TrashIcon className="w-4 h-4 inline-block mr-2" />
                          Remove
                        </Win95Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-8 bg-white border-2 border-gray-400 text-center">
              <UsersIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-mono text-gray-600">
                {searchTerm
                  ? `No team members found matching "${searchTerm}"`
                  : 'No team members yet. Add your first team member!'
                }
              </p>
              {searchTerm && (
                <Win95Button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 font-mono mt-4"
                >
                  Clear Search
                </Win95Button>
              )}
              {!searchTerm && !showAddForm && (
                <Win95Button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 font-mono mt-4"
                >
                  <PlusIcon className="w-4 h-4 inline-block mr-2" />
                  Add First Team Member
                </Win95Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
