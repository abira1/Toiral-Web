import React, { useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { PlusIcon, TrashIcon, AlertCircleIcon } from 'lucide-react';
import { TeamMember } from '../types';

export function TeamMembersManager() {
  const { content, updateContent } = useContent();

  // Debug logging
  useEffect(() => {
    console.log('TeamMembersManager mounted');
    console.log('About content:', content.about);
    console.log('Team members:', content.about?.teamMembers);

    // Initialize about section if it doesn't exist
    if (!content.about || !content.about.teamMembers) {
      console.log('About section or teamMembers is missing, initializing...');

      // Create a new team member with a unique ID
      const newMember = {
        id: Date.now().toString(),
        name: 'New Team Member',
        role: 'Role',
        image: 'https://via.placeholder.com/200?text=Team+Member'
      };

      console.log('Creating new team member:', newMember);

      // Update the content with the new team member
      updateContent({
        about: {
          story: content.about?.story || 'Our company story...',
          teamMembers: [newMember]
        }
      });

      console.log('Initialization request sent!');
    }
  }, [content.about, updateContent]);

  const handleTeamMemberAdd = () => {
    // Create a new team member with a unique ID
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Team Member',
      role: 'Role',
      image: 'https://via.placeholder.com/200'
    };

    console.log('Adding new team member:', newMember);

    // Initialize the about object if it doesn't exist
    if (!content.about) {
      console.log('About section does not exist, creating it now');
      // Create the about section with the new team member
      updateContent({
        about: {
          story: '',
          teamMembers: [newMember]
        }
      });

      console.log('Created new about section with team member:', newMember);
      return;
    }

    // Ensure teamMembers is an array
    const currentTeamMembers = Array.isArray(content.about.teamMembers)
      ? [...content.about.teamMembers] // Create a new array to avoid reference issues
      : [];

    // Add the new member to the array
    const updatedTeamMembers = [...currentTeamMembers, newMember];

    // Preserve the story field if it exists
    const story = content.about.story || '';

    // Update the content with the new team member
    updateContent({
      about: {
        story: story,
        teamMembers: updatedTeamMembers
      }
    });
  };

  const handleTeamMemberRemove = (id: string) => {
    // Check if content.about exists
    if (!content.about) {
      console.error('About section is undefined');
      return;
    }

    // Check if content.about.teamMembers is an array
    if (!Array.isArray(content.about.teamMembers)) {
      console.error('Team members is not an array:', content.about.teamMembers);
      return;
    }

    // Create a filtered copy of the team members array
    const updatedTeamMembers = content.about.teamMembers.filter(member => member.id !== id);

    // Preserve the story field
    const story = content.about.story || '';

    // Update the content without the removed team member
    updateContent({
      about: {
        story: story,
        teamMembers: updatedTeamMembers
      }
    });
  };

  const handleTeamMemberUpdate = (id: string, field: string, value: string) => {
    // Check if content.about exists
    if (!content.about) {
      console.error('About section is undefined');
      return;
    }

    // Check if content.about.teamMembers is an array
    if (!Array.isArray(content.about.teamMembers)) {
      console.error('Team members is not an array:', content.about.teamMembers);
      return;
    }

    // Create an updated copy of the team members array
    const updatedTeamMembers = content.about.teamMembers.map(member =>
      member.id === id
        ? { ...member, [field]: value }
        : member
    );

    // Preserve the story field
    const story = content.about.story || '';

    // Update the content with the modified team member
    updateContent({
      about: {
        story: story,
        teamMembers: updatedTeamMembers
      }
    });
  };

  return (
    <div className="bg-white p-6 border-2 border-blue-500 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6 border-b-2 border-gray-200 pb-2 bg-blue-100 p-3 rounded-t">
        <h3 className="font-mono font-bold text-xl text-blue-700">
          TEAM MEMBERS MANAGEMENT
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 text-sm rounded animate-pulse">ACTIVE</span>
        </h3>
        <Win95Button
          onClick={handleTeamMemberAdd}
          className="px-4 py-2 font-mono bg-green-100 hover:bg-green-200"
        >
          <PlusIcon className="w-4 h-4 inline-block mr-2" />
          Add Member
        </Win95Button>
      </div>

      {/* Debug information */}
      <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded text-sm">
        <details>
          <summary className="font-bold cursor-pointer text-red-600">
            <AlertCircleIcon className="w-4 h-4 inline-block mr-1" />
            IMPORTANT: Debug Info (Click to expand)
          </summary>
          <div className="mt-2 p-2 bg-white rounded border border-gray-300">
            <p className="mb-2 font-bold">Current Team Members Data:</p>
            <pre className="overflow-auto max-h-40 p-2 bg-gray-100 rounded">
              {JSON.stringify(content.about?.teamMembers || [], null, 2)}
            </pre>
            <p className="mt-4 mb-2 font-bold">Full About Object:</p>
            <pre className="overflow-auto max-h-40 p-2 bg-gray-100 rounded">
              {JSON.stringify(content.about || {}, null, 2)}
            </pre>
          </div>
        </details>
      </div>

      {/* Standalone Add Team Member Button */}
      <div className="mb-4">
        <Win95Button
          onClick={handleTeamMemberAdd}
          className="px-4 py-2 font-mono bg-green-100 hover:bg-green-200 w-full text-lg font-bold border-4 border-green-300 animate-pulse"
        >
          <PlusIcon className="w-6 h-6 inline-block mr-2" />
          ADD NEW TEAM MEMBER
        </Win95Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.about?.teamMembers && Array.isArray(content.about.teamMembers) && content.about.teamMembers.length > 0 ? (
          content.about.teamMembers.map(member => (
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
                  onChange={e => handleTeamMemberUpdate(member.id, 'name', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Member Name"
                />
                <input
                  type="text"
                  value={member.role || ''}
                  onChange={e => handleTeamMemberUpdate(member.id, 'role', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Role"
                />
                <input
                  type="url"
                  value={member.image || ''}
                  onChange={e => handleTeamMemberUpdate(member.id, 'image', e.target.value)}
                  className="w-full p-2 border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Image URL"
                />
                <Win95Button
                  onClick={() => handleTeamMemberRemove(member.id)}
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
              onClick={handleTeamMemberAdd}
              className="px-6 py-3 font-mono mx-auto bg-green-100 hover:bg-green-200 text-lg font-bold animate-pulse"
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
