import { PowerIcon, UserIcon, ShieldIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useContent } from '../contexts/ContentContext';

// Helper function to generate placeholder icon SVG
const getPlaceholderIcon = (text = 'Icon') => {
  return `data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E${text}%3C%2Ftext%3E%3C%2Fsvg%3E`;
};

interface StartMenuProps {
  onBookClick: () => void;
  onClose: () => void;
  onAboutClick: () => void;
  onPortfolioClick: () => void;
  onReviewsClick: () => void;
  onContactClick: () => void;
  onChatClick: () => void;
  onUserProfileClick: () => void;
  onServicesClick: () => void;
  onGamesClick?: () => void;
  onCommunityClick?: () => void;
  onSignInClick?: () => void;
}
export function StartMenu({
  onBookClick,
  onClose,
  onAboutClick,
  onPortfolioClick,
  onReviewsClick,
  onContactClick,
  onChatClick,
  onUserProfileClick,
  onServicesClick,
  onGamesClick,
  onCommunityClick,
  onSignInClick
}: StartMenuProps) {
  const { content } = useContent();
  const { user, userProfile, isAdminUser, isModeratorUser } = useAuth();
  const navigate = useNavigate();
  const { settings } = useTheme();

  // Get icon size classes based on theme settings
  const getIconSizeClasses = (isGameIcon = false) => {
    // If it's a game icon and we have game-specific icon size settings, use those
    if (isGameIcon && content?.games?.iconSize) {
      switch (content.games.iconSize) {
        case 'small':
          return 'w-4 h-4 sm:w-5 sm:h-5 object-contain mr-2';
        case 'medium':
          return 'w-5 h-5 sm:w-6 sm:h-6 object-contain mr-3';
        case 'large':
          return 'w-6 h-6 sm:w-7 sm:h-7 object-contain mr-3';
        default:
          return 'w-5 h-5 sm:w-6 sm:h-6 object-contain mr-3';
      }
    }

    // Otherwise use the general theme settings
    switch (settings.menuIcons.size) {
      case 'small':
        return 'w-4 h-4 sm:w-5 sm:h-5 object-contain mr-2';
      case 'medium':
        return 'w-5 h-5 sm:w-6 sm:h-6 object-contain mr-3';
      case 'large':
        return 'w-6 h-6 sm:w-7 sm:h-7 object-contain mr-3';
      default:
        return 'w-5 h-5 sm:w-6 sm:h-6 object-contain mr-3';
    }
  };

  // Get icon URL from theme settings with fallback
  const getIconUrl = (sectionId: string): string => {
    const section = settings.sections.find(s => s.id === sectionId);

    if (section && section.icon) {
      return section.icon;
    }

    // Fallback icons for sections that might not be in theme settings
    const fallbackIcons: Record<string, string> = {
      'about': 'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
      'portfolio': 'https://i.postimg.cc/15k3RcBh/Portfolio.png',
      'book': 'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
      'reviews': 'https://i.postimg.cc/cLf4vgkK/Review.png',
      'services': 'https://i.postimg.cc/wTC4SC9S/e11d1a19-062b-4b8b-b88a-42e855baa176-removebg-preview.png',
      'pricing': 'https://i.postimg.cc/wTC4SC9S/e11d1a19-062b-4b8b-b88a-42e855baa176-removebg-preview.png',
      'contact': 'https://i.postimg.cc/RCb0yzn0/Contact.png',
      'chat': 'https://i.postimg.cc/7hbZhKjD/Chat.png',
      'games': '/assets/images/games.png',
      'reversi': '/assets/images/reversi.png',
      'checkers': '/assets/images/checkers.png',
      'community': '/assets/images/community.png',
      'download': 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png'
    };

    return fallbackIcons[sectionId] || getPlaceholderIcon(sectionId);
  };

  const handleItemClick = (callback: () => void) => {
    callback();
    onClose();
  };

  const handleAdminClick = () => {
    navigate('/admin');
    onClose();
  };
  return <div className="absolute bottom-12 left-0 w-64 bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 shadow-lg">
      <div className="p-2">
        <div className="space-y-1">
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onAboutClick)}>
            <img src={getIconUrl('about')} alt="Toiral" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Toiral');
            }} />
            <span className="font-mono">Toiral</span>
          </div>
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onPortfolioClick)}>
            <img src={getIconUrl('portfolio')} alt="Portfolio" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Portfolio');
            }} />
            <span className="font-mono">Portfolio</span>
          </div>
          {/* Profile section removed as requested */}
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onBookClick)}>
            <img src={getIconUrl('book')} alt="Book" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Book');
            }} />
            <span className="font-mono">Book Appointment</span>
          </div>
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onReviewsClick)}>
            <img src={getIconUrl('reviews')} alt="Reviews" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Reviews');
            }} />
            <span className="font-mono">Reviews</span>
          </div>
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onServicesClick)}>
            <img src={getIconUrl('services')} alt="Services" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Services');
            }} />
            <span className="font-mono">Services</span>
          </div>
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onContactClick)}>
            <img src={getIconUrl('contact')} alt="Contact" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Contact');
            }} />
            <span className="font-mono">Contact Us</span>
          </div>
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => onCommunityClick && handleItemClick(onCommunityClick)}>
            <img src={getIconUrl('community')} alt="Community" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Community');
            }} />
            <span className="font-mono">Community</span>
          </div>
          <div className="border-t border-gray-400 my-2" />
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => {
            if (onGamesClick) {
              handleItemClick(onGamesClick);
            }
          }}>
            <img src={getIconUrl('games')} alt="Games" className={getIconSizeClasses(true)} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Games');
            }} />
            <span className="font-mono">Games</span>
          </div>
          <div className="border-t border-gray-400 my-2" />
          {user && (
            <>
              <div
                className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400"
                onClick={() => handleItemClick(onUserProfileClick)}
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="User"
                    className={getIconSizeClasses() + " rounded-full"}
                  />
                ) : (
                  <UserIcon className={getIconSizeClasses()} />
                )}
                <span className="font-mono">
                  {userProfile?.displayName ? `${userProfile.displayName}'s Account` : 'My Account'}
                </span>
              </div>

              {/* Admin Panel link - visible to both admin and moderator users */}
              {(isAdminUser || isModeratorUser) && (
                <div
                  className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400"
                  onClick={handleAdminClick}
                >
                  <ShieldIcon className={`${getIconSizeClasses()} ${isAdminUser ? "text-green-700" : "text-blue-700"}`} />
                  <span className={`font-mono font-bold ${isAdminUser ? "text-green-700" : "text-blue-700"}`}>
                    {isAdminUser ? "Admin Panel" : "Moderator Panel"}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={() => handleItemClick(onChatClick)}>
            <img src={getIconUrl('chat')} alt="Chat" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Chat');
            }} />
            <span className="font-mono">Live Chat</span>
          </div>

          {/* Download App option */}
          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400"
               onClick={() => {
                 const event = new CustomEvent('showInstallPrompt');
                 window.dispatchEvent(event);
                 onClose();
               }}>
            <img src={getIconUrl('download')} alt="Download App" className={getIconSizeClasses()} onError={(e) => {
              (e.target as HTMLImageElement).src = getPlaceholderIcon('Download');
            }} />
            <span className="font-mono">Download App</span>
          </div>

          {/* Sign In / Register button - only visible when user is not logged in */}
          {!user && onSignInClick && (
            <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400"
                onClick={() => handleItemClick(onSignInClick)}>
              <UserIcon className={getIconSizeClasses() + " text-blue-700"} />
              <span className="font-mono text-blue-700 font-bold">Sign In / Register</span>
            </div>
          )}

          <div className="flex items-center bg-gray-300 px-4 py-2 cursor-pointer hover:bg-gray-400" onClick={onClose}>
            <PowerIcon className={getIconSizeClasses()} />
            <span className="font-mono">Close Menu</span>
          </div>
        </div>
      </div>
    </div>;
}