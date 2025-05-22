import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { DownloadIcon } from 'lucide-react';

interface DownloadAppButtonProps {
  className?: string;
  onClick?: () => void;
}

export function DownloadAppButton({ className = '', onClick }: DownloadAppButtonProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event to determine if the app is installable
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if we've already captured the beforeinstallprompt event
    if ((window as any).deferredPrompt) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleClick = () => {
    // Dispatch a custom event to trigger the install prompt
    const event = new CustomEvent('showInstallPrompt');
    window.dispatchEvent(event);

    // Call the onClick prop if provided
    if (onClick) {
      onClick();
    }
  };

  if (isInstalled) {
    return (
      <Win95Button
        className={`px-4 py-2 font-mono flex items-center opacity-50 cursor-not-allowed ${className}`}
        disabled={true}
      >
        <DownloadIcon className="w-4 h-4 mr-2" />
        Already Installed
      </Win95Button>
    );
  }

  if (!isInstallable) {
    return (
      <Win95Button
        className={`px-4 py-2 font-mono flex items-center opacity-50 cursor-not-allowed ${className}`}
        disabled={true}
      >
        <DownloadIcon className="w-4 h-4 mr-2" />
        Not Installable
      </Win95Button>
    );
  }

  return (
    <Win95Button
      className={`px-4 py-2 font-mono flex items-center ${className}`}
      onClick={handleClick}
    >
      <DownloadIcon className="w-4 h-4 mr-2" />
      Download App
    </Win95Button>
  );
}
