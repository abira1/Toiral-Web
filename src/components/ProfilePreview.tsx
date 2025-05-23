import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, CheckCircleIcon } from 'lucide-react';

interface ProfilePreviewProps {
  showEmail?: boolean;
  showAvatar?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfilePreview({ 
  showEmail = true, 
  showAvatar = true, 
  className = '',
  size = 'md'
}: ProfilePreviewProps) {
  const { getUserProfileData } = useAuth();
  const profileData = getUserProfileData();

  if (!profileData) {
    return null;
  }

  const sizeClasses = {
    sm: {
      container: 'p-3',
      avatar: 'w-8 h-8',
      name: 'text-sm',
      email: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'p-4',
      avatar: 'w-10 h-10',
      name: 'text-base',
      email: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      container: 'p-6',
      avatar: 'w-12 h-12',
      name: 'text-lg',
      email: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg ${sizes.container} ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        {showAvatar && (
          <div className="flex-shrink-0">
            {profileData.photoURL ? (
              <img
                src={profileData.photoURL}
                alt={profileData.name}
                className={`${sizes.avatar} rounded-full object-cover border-2 border-green-300`}
              />
            ) : (
              <div className={`${sizes.avatar} rounded-full bg-green-200 flex items-center justify-center border-2 border-green-300`}>
                <UserIcon className={`${sizes.icon} text-green-600`} />
              </div>
            )}
          </div>
        )}

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`font-mono font-bold text-green-800 ${sizes.name} truncate`}>
              {profileData.name}
            </h4>
            <CheckCircleIcon className={`${sizes.icon} text-green-600 flex-shrink-0`} />
          </div>
          {showEmail && profileData.email && (
            <p className={`font-mono text-green-600 ${sizes.email} truncate`}>
              {profileData.email}
            </p>
          )}
        </div>

        {/* Verified Badge */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-mono font-medium bg-green-100 text-green-800 border border-green-300">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}
