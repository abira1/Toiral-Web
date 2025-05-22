import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import {
  UserIcon,
  TrashIcon,
  RefreshCwIcon,
  SearchIcon,
  ClockIcon,
  UserXIcon,
  AlertTriangleIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import {
  fetchAllUserLoginData,
  fetchRecentLoginRecords,
  subscribeToUserLoginData,
  subscribeToLoginRecords,
  deleteUserLoginData,
  updateUserLoginData,
  clearAllLoginRecords
} from '../../services/userManagementService';
import { UserLoginData, UserLoginRecord } from '../../models/UserLoginData';

export function AccountManager() {
  const [users, setUsers] = useState<UserLoginData[]>([]);
  const [loginRecords, setLoginRecords] = useState<UserLoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'loginHistory'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserLoginData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearLoginConfirm, setShowClearLoginConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Subscribe to user login data
        const unsubscribeUsers = subscribeToUserLoginData((data) => {
          setUsers(data);
          setIsLoading(false);
        });

        // Subscribe to login records
        const unsubscribeRecords = subscribeToLoginRecords((data) => {
          setLoginRecords(data);
        });

        return () => {
          unsubscribeUsers();
          unsubscribeRecords();
        };
      } catch (error) {
        console.error('Error loading account data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.displayName?.toLowerCase().includes(searchLower) || false) ||
      (user.email?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Filter login records based on search term
  const filteredLoginRecords = loginRecords.filter(record => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchingUser = users.find(user => user.uid === record.uid);

    return (
      (matchingUser?.displayName?.toLowerCase().includes(searchLower) || false) ||
      (matchingUser?.email?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserLoginData(selectedUser.uid);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      setActionMessage({
        type: 'success',
        text: `User ${selectedUser.displayName || selectedUser.email || 'Unknown'} has been deleted.`
      });

      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setActionMessage({
        type: 'error',
        text: 'Failed to delete user. Please try again.'
      });
    }
  };

  // Handle clearing all login records
  const handleClearLoginRecords = async () => {
    try {
      await clearAllLoginRecords();
      setShowClearLoginConfirm(false);
      setActionMessage({
        type: 'success',
        text: 'All login records have been cleared successfully.'
      });

      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    } catch (error) {
      console.error('Error clearing login records:', error);
      setActionMessage({
        type: 'error',
        text: 'Failed to clear login records. Please try again.'
      });
    }
  };

  return (
    <div className="bg-gray-300 p-4">
      <h2 className="font-mono text-xl font-bold mb-4 pb-2 border-b border-gray-400">
        Account Manager
      </h2>

      {/* Action message */}
      {actionMessage && (
        <div className={`mb-4 p-3 flex items-center ${
          actionMessage.type === 'success' ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckIcon className="w-5 h-5 mr-2 text-green-600" />
          ) : (
            <AlertTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
          )}
          <p className="font-mono text-sm">{actionMessage.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-400">
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'users' ? 'bg-white border-2 border-b-0 border-gray-400' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('users')}
        >
          <UserIcon className="w-4 h-4 inline-block mr-2" />
          Users
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'loginHistory' ? 'bg-white border-2 border-b-0 border-gray-400' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('loginHistory')}
        >
          <ClockIcon className="w-4 h-4 inline-block mr-2" />
          Login History
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 pl-10"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
        </div>
        <Win95Button
          className="ml-2 px-3 py-2 font-mono"
          onClick={() => setSearchTerm('')}
        >
          Clear
        </Win95Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="font-mono">Loading account data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'users' ? (
            <div className="bg-white border-2 border-gray-400">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-400">
                    <th className="p-2 text-left font-mono">User</th>
                    <th className="p-2 text-left font-mono">Email</th>
                    <th className="p-2 text-left font-mono">First Login</th>
                    <th className="p-2 text-left font-mono">Last Login</th>
                    <th className="p-2 text-left font-mono">Login Count</th>
                    <th className="p-2 text-center font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.uid} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="p-2 font-mono">
                          <div className="flex items-center">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || 'User'}
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            ) : (
                              <UserIcon className="w-8 h-8 p-1 bg-gray-200 rounded-full mr-2" />
                            )}
                            <span>{user.displayName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-2 font-mono">{user.email || 'No email'}</td>
                        <td className="p-2 font-mono">{formatDate(user.firstLogin)}</td>
                        <td className="p-2 font-mono">{formatDate(user.lastLogin)}</td>
                        <td className="p-2 font-mono">{user.loginCount}</td>
                        <td className="p-2 text-center">
                          <Win95Button
                            className="px-2 py-1"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <TrashIcon className="w-4 h-4 text-red-600" />
                          </Win95Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center font-mono text-gray-500">
                        {searchTerm ? 'No users match your search.' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              {/* Action buttons for login history */}
              <div className="mb-4 flex justify-end">
                <Win95Button
                  className="px-4 py-2 font-mono bg-red-100 flex items-center"
                  onClick={() => setShowClearLoginConfirm(true)}
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Clear All Login Records
                </Win95Button>
              </div>

              <div className="bg-white border-2 border-gray-400">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-400">
                      <th className="p-2 text-left font-mono">User</th>
                      <th className="p-2 text-left font-mono">Timestamp</th>
                      <th className="p-2 text-left font-mono">Browser</th>
                      <th className="p-2 text-left font-mono">Device</th>
                    </tr>
                  </thead>
                <tbody>
                  {filteredLoginRecords.length > 0 ? (
                    filteredLoginRecords.map((record, index) => {
                      const user = users.find(u => u.uid === record.uid);
                      return (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="p-2 font-mono">
                            <div className="flex items-center">
                              {user?.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName || 'User'}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                              ) : (
                                <UserIcon className="w-8 h-8 p-1 bg-gray-200 rounded-full mr-2" />
                              )}
                              <div>
                                <div>{user?.displayName || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 font-mono">{formatDate(record.timestamp)}</td>
                          <td className="p-2 font-mono">{record.browser || 'Unknown'}</td>
                          <td className="p-2 font-mono">{record.device || 'Unknown'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center font-mono text-gray-500">
                        {searchTerm ? 'No login records match your search.' : 'No login records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-300 border-2 border-gray-400 shadow-lg p-4 max-w-md w-full">
            <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4 flex justify-between items-center">
              <span>Confirm Deletion</span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-4">
                <UserXIcon className="w-10 h-10 text-red-600 mr-4" />
                <div>
                  <h3 className="font-mono font-bold">Delete User Data</h3>
                  <p className="font-mono text-sm text-gray-700">
                    Are you sure you want to delete login data for:
                  </p>
                  <p className="font-mono font-bold mt-2">
                    {selectedUser.displayName || 'Unknown'} ({selectedUser.email || 'No email'})
                  </p>
                </div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-400 p-3 mb-4">
                <p className="font-mono text-sm text-yellow-800">
                  <AlertTriangleIcon className="w-4 h-4 inline-block mr-1" />
                  This will only delete the login tracking data. The user's Firebase account will remain active.
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Win95Button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 font-mono"
                >
                  Cancel
                </Win95Button>
                <Win95Button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 font-mono bg-red-100"
                >
                  <TrashIcon className="w-4 h-4 mr-1 inline-block" />
                  Delete
                </Win95Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Login Records confirmation dialog */}
      {showClearLoginConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-300 border-2 border-gray-400 shadow-lg p-4 max-w-md w-full">
            <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4 flex justify-between items-center">
              <span>Confirm Clear Login Records</span>
              <button
                onClick={() => setShowClearLoginConfirm(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center mb-4">
                <TrashIcon className="w-10 h-10 text-red-600 mr-4" />
                <div>
                  <h3 className="font-mono font-bold">Clear All Login Records</h3>
                  <p className="font-mono text-sm text-gray-700">
                    Are you sure you want to clear all login history records?
                  </p>
                </div>
              </div>

              <div className="bg-yellow-100 border-2 border-yellow-400 p-3 mb-4">
                <p className="font-mono text-sm text-yellow-800">
                  <AlertTriangleIcon className="w-4 h-4 inline-block mr-1" />
                  This will permanently delete all login history records. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Win95Button
                  onClick={() => setShowClearLoginConfirm(false)}
                  className="px-4 py-2 font-mono"
                >
                  Cancel
                </Win95Button>
                <Win95Button
                  onClick={handleClearLoginRecords}
                  className="px-4 py-2 font-mono bg-red-100"
                >
                  <TrashIcon className="w-4 h-4 mr-1 inline-block" />
                  Clear All Records
                </Win95Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
