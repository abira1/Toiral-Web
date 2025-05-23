import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserLogin } from './UserLogin';
import { UserIcon, ShieldCheckIcon, StarIcon, MessageSquareIcon } from 'lucide-react';
import { Win95Button } from './Win95Button';

interface AuthRequiredWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: 'review' | 'contact' | 'user';
  onAuthSuccess?: () => void;
}

export function AuthRequiredWrapper({ 
  children, 
  title, 
  description, 
  icon = 'user',
  onAuthSuccess 
}: AuthRequiredWrapperProps) {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const getIcon = () => {
    switch (icon) {
      case 'review':
        return <StarIcon className="w-12 h-12 text-blue-600" />;
      case 'contact':
        return <MessageSquareIcon className="w-12 h-12 text-blue-600" />;
      default:
        return <UserIcon className="w-12 h-12 text-blue-600" />;
    }
  };

  const handleAuthSuccess = () => {
    setShowLogin(false);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  // If user is authenticated, show the wrapped content
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If login dialog is shown, display it
  if (showLogin) {
    return (
      <div className="p-6 bg-gray-200 text-black">
        <div className="max-w-md mx-auto">
          <UserLogin 
            onClose={() => setShowLogin(false)}
            onSuccess={handleAuthSuccess}
          />
        </div>
      </div>
    );
  }

  // Show authentication required message
  return (
    <div className="p-6 bg-gray-200 text-black">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="font-mono font-bold text-lg mb-3 text-gray-900">
            {title}
          </h3>

          {/* Description */}
          <p className="font-mono text-sm text-gray-700 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Benefits */}
          <div className="mb-6 text-left">
            <h4 className="font-mono font-bold text-sm mb-3 text-gray-800">
              Why sign in?
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-600">
              <li className="flex items-start">
                <ShieldCheckIcon className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Automatic profile information</span>
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Secure and verified submissions</span>
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span>No need to re-enter your details</span>
              </li>
              <li className="flex items-start">
                <ShieldCheckIcon className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Better spam protection</span>
              </li>
            </ul>
          </div>

          {/* Sign In Button */}
          <Win95Button
            onClick={() => setShowLogin(true)}
            className="w-full px-4 py-3 font-mono font-bold bg-blue-100 hover:bg-blue-200 border-blue-400"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Sign In with Google
          </Win95Button>

          {/* Privacy Note */}
          <p className="font-mono text-xs text-gray-500 mt-4 leading-relaxed">
            We only use your Google account for authentication and to populate your profile information. 
            Your data is kept secure and private.
          </p>
        </div>
      </div>
    </div>
  );
}
