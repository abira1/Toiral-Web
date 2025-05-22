import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, get, set, update, remove } from 'firebase/database';
import { UserIcon, TrashIcon, CheckIcon, XIcon, SearchIcon, UserPlusIcon, ShieldIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'user' | 'moderator' | 'admin';
}

export function ModeratorManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isAdminUser } = useAuth();

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const profilesRef = ref(database, 'profile');
        const snapshot = await get(profilesRef);

        if (snapshot.exists()) {
          const profilesData = snapshot.val();
          const usersArray: UserData[] = Object.values(profilesData);

          // Sort users by role (admin first, then moderators, then regular users)
          usersArray.sort((a, b) => {
            const roleOrder = { 'admin': 0, 'moderator': 1, 'user': 2, undefined: 3 };
            const roleA = a.role || 'user';
            const roleB = b.role || 'user';

            return (roleOrder[roleA as keyof typeof roleOrder] - roleOrder[roleB as keyof typeof roleOrder]);
          });

          setUsers(usersArray);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  // Set user role
  const setUserRole = async (uid: string, role: 'user' | 'moderator' | 'admin') => {
    try {
      setError(null);
      const userRef = ref(database, `profile/${uid}`);

      // Update the role
      await update(userRef, { role });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.uid === uid ? { ...user, role } : user
        )
      );

      // Show success message
      setSuccessMessage(`User role updated to ${role} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // If this was the selected user, update the selected user
      if (selectedUser && selectedUser.uid === uid) {
        setSelectedUser({ ...selectedUser, role });
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  // Get role badge
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ShieldIcon className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ShieldIcon className="w-3 h-3 mr-1" />
            Moderator
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <UserIcon className="w-3 h-3 mr-1" />
            User
          </span>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-200 text-black">
      <h2 className="font-mono font-bold text-xl mb-4 pb-2 border-b-2 border-gray-400">
        Moderator Management
      </h2>

      {error && (
        <div className="bg-red-100 border-2 border-red-400 p-3 mb-4">
          <p className="font-mono text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 flex items-center">
          <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
          <p className="font-mono text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-4 flex">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-2 border-gray-400 font-mono"
            placeholder="Search users by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users list */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2 bg-white border-2 border-gray-400 p-4 h-96 overflow-y-auto">
          <h3 className="font-mono font-bold mb-4">Users</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-2">
              {filteredUsers.map(user => (
                <div
                  key={user.uid}
                  className={`p-2 border-2 border-gray-300 cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                    selectedUser?.uid === user.uid ? 'bg-blue-50 border-blue-400' : ''
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 p-1 bg-gray-200 rounded-full mr-2" />
                    )}
                    <div>
                      <div className="font-mono font-bold">{user.displayName || 'Unnamed User'}</div>
                      <div className="font-mono text-xs text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  <div>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-mono text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* User details and role management */}
        <div className="md:w-1/2 bg-white border-2 border-gray-400 p-4 h-96 overflow-y-auto">
          <h3 className="font-mono font-bold mb-4">User Details</h3>

          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center">
                {selectedUser.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName || 'User'}
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 p-3 bg-gray-200 rounded-full mr-4" />
                )}
                <div>
                  <div className="font-mono font-bold text-lg">{selectedUser.displayName || 'Unnamed User'}</div>
                  <div className="font-mono text-gray-600">{selectedUser.email}</div>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-4 mt-4">
                <h4 className="font-mono font-bold mb-2">Change Role</h4>
                <div className="flex flex-wrap gap-2">
                  <Win95Button
                    onClick={() => setUserRole(selectedUser.uid, 'user')}
                    className={`px-3 py-1 font-mono text-sm ${selectedUser.role === 'user' ? 'bg-gray-300' : ''}`}
                    disabled={selectedUser.role === 'user'}
                  >
                    <UserIcon className="w-4 h-4 mr-1 inline-block" />
                    Regular User
                  </Win95Button>

                  <Win95Button
                    onClick={() => setUserRole(selectedUser.uid, 'moderator')}
                    className={`px-3 py-1 font-mono text-sm ${selectedUser.role === 'moderator' ? 'bg-blue-100' : ''}`}
                    disabled={selectedUser.role === 'moderator'}
                  >
                    <ShieldIcon className="w-4 h-4 mr-1 inline-block" />
                    Moderator
                  </Win95Button>

                  {/* Only admins can assign admin role */}
                  {isAdminUser ? (
                    <Win95Button
                      onClick={() => setUserRole(selectedUser.uid, 'admin')}
                      className={`px-3 py-1 font-mono text-sm ${selectedUser.role === 'admin' ? 'bg-red-100' : ''}`}
                      disabled={selectedUser.role === 'admin'}
                    >
                      <ShieldIcon className="w-4 h-4 mr-1 inline-block" />
                      Admin
                    </Win95Button>
                  ) : (
                    <div className="text-xs text-gray-500 italic mt-2">
                      <ShieldIcon className="w-3 h-3 inline-block mr-1" />
                      Only admins can assign admin roles
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-mono text-gray-500">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
