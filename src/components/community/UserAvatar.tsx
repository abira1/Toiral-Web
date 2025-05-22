import React, { useState } from 'react';
import { UserIcon } from 'lucide-react';

interface UserAvatarProps {
  username: string;
  photoURL?: string | null;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function UserAvatar({ username, photoURL, size = 'medium', className = '' }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Get initials from username (up to 2 characters)
  const getInitials = (name: string): string => {
    if (!name) return '?';

    const parts = name.split(' ');
    if (parts.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Determine size classes
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base'
  };

  const initials = getInitials(username);
  const hasValidPhoto = photoURL && !imageError;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center overflow-hidden
        bg-gray-200 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800
        ${className}
      `}
    >
      {hasValidPhoto ? (
        <img
          src={photoURL}
          alt={`${username}'s avatar`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-bold font-mono">{initials}</span>
      )}
    </div>
  );
}
