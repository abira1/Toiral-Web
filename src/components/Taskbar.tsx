import React, { useEffect, useState } from 'react';
import { Win95Button } from './Win95Button';
import { StartMenu } from './StartMenu';
import { useTheme } from '../contexts/ThemeContext';
interface TaskbarProps {
  onChatClick: () => void;
  onBookClick: () => void;
  onAboutClick: () => void;
  onPortfolioClick: () => void;
  onReviewsClick: () => void;
  onContactClick: () => void;
  onDatabaseClick: () => void;
  onUserProfileClick: () => void;
  onServicesClick: () => void;
  onGamesClick?: () => void;
  onCommunityClick?: () => void;
  onSignInClick?: () => void;
  className?: string;
}
export function Taskbar({
  onChatClick,
  onBookClick,
  onAboutClick,
  onPortfolioClick,
  onReviewsClick,
  onContactClick,
  onDatabaseClick,
  onUserProfileClick,
  onServicesClick,
  onGamesClick,
  onCommunityClick,
  onSignInClick,
  className = ''
}: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const { settings } = useTheme();

  // Get icon URL from theme settings with fallback
  const getIconUrl = (sectionId: string): string => {
    const section = settings.sections.find(s => s.id === sectionId);

    if (section && section.icon) {
      return section.icon;
    }

    // Fallback icons for sections that might not be in theme settings
    const fallbackIcons: Record<string, string> = {
      'chat': 'https://i.postimg.cc/7hbZhKjD/Chat.png',
      'book': 'https://i.postimg.cc/W3N3LNnd/Appoinment.png'
    };

    return fallbackIcons[sectionId] || 'https://via.placeholder.com/40?text=Icon';
  };
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateTime(); // Initial update
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  return <div className={`h-12 w-full bg-gray-300 border-t-2 border-white flex items-center px-1 z-10 ${className}`}>
      <div className="relative">
        <Win95Button className={`h-10 px-2 md:px-4 font-bold flex items-center text-sm md:text-base ${startMenuOpen ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`} onClick={() => setStartMenuOpen(!startMenuOpen)}>
          <img src="/toiral.png" alt="Logo" className="h-6 mr-1 md:mr-2" />
          Start
        </Win95Button>
        {startMenuOpen && (
          <StartMenu
            onBookClick={onBookClick}
            onChatClick={onChatClick}
            onAboutClick={onAboutClick}
            onPortfolioClick={onPortfolioClick}
            onReviewsClick={onReviewsClick}
            onContactClick={onContactClick}
            onUserProfileClick={onUserProfileClick}
            onServicesClick={onServicesClick}
            onGamesClick={onGamesClick}
            onCommunityClick={onCommunityClick}
            onSignInClick={onSignInClick}
            onClose={() => setStartMenuOpen(false)}
          />
        )}
      </div>
      <div className="ml-1 md:ml-2 flex space-x-1 md:space-x-2">
        <Win95Button className="h-10 w-8 md:w-10 flex items-center justify-center" onClick={onChatClick}>
          <img
            src={getIconUrl('chat')}
            alt="Chat"
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://i.postimg.cc/7hbZhKjD/Chat.png';
            }}
          />
        </Win95Button>
        <Win95Button className="h-10 w-8 md:w-10 flex items-center justify-center" onClick={onBookClick}>
          <img
            src={getIconUrl('book')}
            alt="Book"
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://i.postimg.cc/W3N3LNnd/Appoinment.png';
            }}
          />
        </Win95Button>
      </div>
      <div className="ml-auto flex items-center space-x-1 md:space-x-2">
        <Win95Button className="h-10 px-2 md:px-3 flex items-center">
          <span className="font-mono text-sm md:text-base">{currentTime}</span>
        </Win95Button>
      </div>
    </div>;
}