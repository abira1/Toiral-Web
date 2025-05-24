import React, { useState, useEffect } from 'react';
import { AdminPanel } from '../components/AdminPanel.tsx';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Win95Button } from '../components/Win95Button';
import { LogOutIcon, DatabaseIcon, UsersIcon, ShieldIcon, UsersRoundIcon, UserIcon } from 'lucide-react';
import { DatabaseInitializer } from '../components/DatabaseInitializer';
import { AccountManager } from '../components/admin/AccountManager.jsx';
export function AdminPage() {
  const { logout, isAdminUser, isModeratorUser, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showDatabaseTools, setShowDatabaseTools] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'accounts'>('content');

  // Verify admin or moderator access on component mount and when user changes
  useEffect(() => {
    // Double-check that the user is an admin or moderator
    if (!isAdminUser && !isModeratorUser && user) {
      // If user is logged in but not an admin or moderator, redirect to not-found
      navigate('/not-found', { replace: true });
    }
  }, [isAdminUser, isModeratorUser, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full min-h-screen bg-teal-600 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 bg-gray-300 p-2 border-2 border-white border-r-gray-800 border-b-gray-800">
          <div className="flex items-center gap-4">
            <img src="/toiral.png" alt="Logo" className="h-8 w-8" />
            <div>
              <h1 className="font-mono text-lg font-bold">Admin Control Panel</h1>
              {user?.email && (
                <div className="flex items-center text-xs font-mono">
                  {isAdminUser ? (
                    <div className="text-red-700">
                      <ShieldIcon className="w-3 h-3 mr-1 inline" />
                      Admin: {user.email}
                    </div>
                  ) : isModeratorUser ? (
                    <div className="text-blue-700">
                      <ShieldIcon className="w-3 h-3 mr-1 inline" />
                      Moderator: {user.email}
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      <UserIcon className="w-3 h-3 mr-1 inline" />
                      User: {user.email}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Win95Button
              className="px-4 py-2 font-mono flex items-center hover:bg-green-100 bg-green-50 animate-pulse"
              onClick={() => navigate('/team-members')}
            >
              <UsersRoundIcon className="w-4 h-4 mr-2" />
              Team Members
            </Win95Button>
            {/* Only show database tools button for admins */}
            {isAdminUser && (
              <Win95Button
                className="px-4 py-2 font-mono flex items-center hover:bg-blue-100"
                onClick={() => setShowDatabaseTools(!showDatabaseTools)}
              >
                <DatabaseIcon className="w-4 h-4 mr-2" />
                {showDatabaseTools ? 'Hide DB Tools' : 'Show DB Tools'}
              </Win95Button>
            )}
            <Win95Button
              className="px-4 py-2 font-mono flex items-center hover:bg-red-100"
              onClick={handleLogout}
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Win95Button>
          </div>
        </div>

        {/* Only show database tools for admins */}
        {isAdminUser && showDatabaseTools && (
          <div className="mb-4">
            <DatabaseInitializer />
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-4">
          <Win95Button
            className={`px-6 py-2 font-mono flex items-center ${activeTab === 'content' ? 'bg-blue-100' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <DatabaseIcon className="w-4 h-4 mr-2" />
            Content Management
          </Win95Button>

          <Win95Button
            className={`px-6 py-2 font-mono flex items-center ${activeTab === 'accounts' ? 'bg-blue-100' : ''}`}
            onClick={() => setActiveTab('accounts')}
          >
            <UsersIcon className="w-4 h-4 mr-2" />
            Account Manager
          </Win95Button>
        </div>

        <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800">
          {activeTab === 'content' ? (
            <AdminPanel />
          ) : (
            <AccountManager />
          )}
        </div>
      </div>
    </div>
  );
}