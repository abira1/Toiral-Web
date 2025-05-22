import React, { useEffect, useState, lazy, Suspense } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { DialogWindow } from './DialogWindow';
import { EnhancedClock } from './EnhancedClock';
import { PhoneIcon, LoaderIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { UserLogin } from './UserLogin';
import { LazyImage } from './LazyImage';
import { TeamMembersSection } from './TeamMembersSection';
import { SocialProofDisplay } from './social/SocialProofDisplay';
import { ImageLoadingTest } from './ImageLoadingTest';

// Lazy-loaded components
const AppointmentManager = lazy(() => import('./AppointmentManager').then(module => ({ default: module.AppointmentManager })));
const ChatBox = lazy(() => import('./ChatBox').then(module => ({ default: module.ChatBox })));
const ReviewForm = lazy(() => import('./ReviewForm').then(module => ({ default: module.ReviewForm })));
const ContactForm = lazy(() => import('./ContactForm').then(module => ({ default: module.ContactForm })));
const GameWindow = lazy(() => import('./GameWindow').then(module => ({ default: module.GameWindow })));
const UserProfile = lazy(() => import('./UserProfile').then(module => ({ default: module.UserProfile })));
const FirebaseAuthDiagnostic = lazy(() => import('./FirebaseAuthDiagnostic').then(module => ({ default: module.FirebaseAuthDiagnostic })));
const PricingSection = lazy(() => import('./PricingSection').then(module => ({ default: module.PricingSection })));
const PortfolioDisplay = lazy(() => import('./PortfolioDisplay'));
const GamesSection = lazy(() => import('./GamesSection').then(module => ({ default: module.GamesSection })));
const CommunityForum = lazy(() => import('./community/CommunityForum').then(module => ({ default: module.CommunityForum })));

// Loading fallback for lazy-loaded dialog content
function DialogLoadingFallback() {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gray-200">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-mono text-gray-700">Loading content...</p>
      </div>
    </div>
  );
}

export function Windows95Desktop() {
  const {
    settings,
    isLoading: isThemeLoading
  } = useTheme();
  const {
    content
  } = useContent();
  const {
    // user and userProfile are not used but might be needed in the future
    isAuthenticated
  } = useAuth();

  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  /*
   * These state variables are commented out to avoid TypeScript warnings
   * They might be needed in the future for booking confirmations
   */
  // const [pendingBookings, setPendingBookings] = useState<string[]>([]);
  // const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  // const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showDiagnosticDialog, setShowDiagnosticDialog] = useState(false);
  useEffect(() => {
    const handleContentUpdate = (event: any) => {
      const {
        type,
        data
      } = event.detail;
      if (type === 'booking_update' && data.status === 'approved') {
        const booking = content?.bookings.find(b => b.id === data.id);
        if (booking) {
          // These state setters are commented out to avoid TypeScript warnings
          // setConfirmedBooking(booking);
          // setShowBookingConfirmation(true);
          console.log('Booking approved:', booking);
        }
      }
    };

    // Listen for custom event from PricingDisplay component
    const handleOpenDialog = (event: any) => {
      const { id } = event.detail;
      if (id) {
        handleIconClick(id);
      }
    };

    // Listen for custom event to open a game
    const handleOpenGame = (event: any) => {
      const { gameId } = event.detail;
      if (gameId) {
        handleIconClick(gameId);
      }
    };

    const windowWithEvents = window as any;
    windowWithEvents.addEventListener('contentUpdate', handleContentUpdate);
    window.addEventListener('openDialog', handleOpenDialog);
    window.addEventListener('openGame', handleOpenGame);

    // Add keyboard shortcut for diagnostic tool (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDiagnosticDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      windowWithEvents.removeEventListener('contentUpdate', handleContentUpdate);
      window.removeEventListener('openDialog', handleOpenDialog);
      window.removeEventListener('openGame', handleOpenGame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [content?.bookings]);
  const handleIconClick = (id: string) => {
    if (!content) {
      console.error('Content is not available');
      return;
    }

    // Handle sign-in click
    if (id === 'signIn') {
      setShowLoginDialog(true);
      return;
    }

    // Handle book appointment click - require login
    if (id === 'book' && !isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }

    // Handle user profile click
    if (id === 'userProfile') {
      if (isAuthenticated) {
        openDialog('userProfile', 'My Account',
          <Suspense fallback={<DialogLoadingFallback />}>
            <UserProfile onClose={closeDialog} />
          </Suspense>
        );
      } else {
        setShowLoginDialog(true);
      }
      return;
    }

    let title = '';
    let newDialogContent = null;
    switch (id) {
      case 'about':
        title = 'About Toiral';
        newDialogContent = <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
              <section className="relative h-48 md:h-64 bg-white border-2 border-gray-400 rounded-lg overflow-hidden">
                <LazyImage
                  src={content.company.headerImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  placeholderSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221200%22%20height%3D%22400%22%20viewBox%3D%220%200%201200%20400%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%221200%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ELoading...%3C%2Ftext%3E%3C%2Fsvg%3E"
                  onError={e => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221200%22%20height%3D%22400%22%20viewBox%3D%220%200%201200%20400%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%221200%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2230%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ECover%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="font-mono text-3xl font-bold mb-2">
                      {content.company.name}
                    </h1>
                    <p className="font-mono text-lg">
                      {content.company.tagline}
                    </p>
                  </div>
                </div>
              </section>
              {/* Vision Section */}
              <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <h2 className="text-xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
                  Our Vision
                </h2>
                <div className="font-mono whitespace-pre-line leading-relaxed text-gray-700">
                  {content.aboutUs?.vision || (content.about as any)?.vision || 'Our vision statement is coming soon...'}
                </div>
              </section>

              {/* Story Section */}
              <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <h2 className="text-xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
                  Our Story
                </h2>
                <div className="font-mono whitespace-pre-line leading-relaxed text-gray-700">
                  {content.aboutUs?.story || content.about?.story || 'Our story is coming soon...'}
                </div>
              </section>

              {/* Team Section */}
              <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <h2 className="text-xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
                  Our Team
                </h2>
                <TeamMembersSection teamMembers={content.about?.teamMembers} />
              </section>

              {/* Gallery Section */}
              <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <h2 className="text-xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
                  Gallery
                </h2>
                {content.aboutUs?.gallery && content.aboutUs.gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.aboutUs.gallery.map((image: any) => (
                      <div key={image.id} className="space-y-2">
                        <LazyImage
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-48 object-cover border-2 border-gray-400"
                          placeholderSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ELoading...%3C%2Ftext%3E%3C%2Fsvg%3E"
                          onError={e => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                        />
                        <p className="font-mono text-sm text-center text-gray-600">
                          {image.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="font-mono text-gray-600">
                      No gallery images available
                    </p>
                  </div>
                )}
              </section>

              {/* Social Proof Section */}
              <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <h2 className="text-xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
                  Our Community
                </h2>
                <SocialProofDisplay />
              </section>

              {/* Pricing Section removed as requested */}
            </div>
          </div>;
        break;
      /* Profile section removed as requested */
      case 'portfolio':
        title = 'Portfolio';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <PortfolioDisplay />
          </Suspense>
        );
        break;
      case 'reviews':
        title = 'Client Reviews';
        newDialogContent = <div className="p-4 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
            <div className="mb-6 border-b-2 border-gray-400 pb-4">
              <h3 className="font-mono font-bold mb-4">Write a Review</h3>
              <ReviewForm />
            </div>
            <h3 className="font-mono font-bold mb-4">Recent Reviews</h3>
            {Array.isArray(content.reviews) ?
              content.reviews
                .filter(review => review && review.approved)
                .sort((a, b) => {
                  try {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                  } catch (error) {
                    return 0;
                  }
                })
                .map(review => (
                  <div key={review.id} className="mb-4 p-3 bg-white border-2 border-gray-400">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {review.avatar && (
                          <LazyImage
                            src={review.avatar}
                            alt={review.name}
                            className="w-10 h-10 rounded-full mr-2 object-cover"
                            placeholderSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E";
                            }}
                          />
                        )}
                        <div>
                          <span className="font-mono font-bold block">{review.name}</span>
                          {review.company && (
                            <span className="font-mono text-xs text-gray-600 block">
                              {review.company}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-sm">
                        {(() => {
                          try {
                            return new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short'
                            });
                          } catch (error) {
                            return review.date || 'Unknown date';
                          }
                        })()}
                      </span>
                    </div>
                    <div className="mb-2 text-yellow-500">
                      {'★'.repeat(Math.min(Math.max(review.rating || 0, 0), 5))}
                      {'☆'.repeat(5 - Math.min(Math.max(review.rating || 0, 0), 5))}
                    </div>
                    <p className="font-mono text-sm">{review.review}</p>
                  </div>
                ))
              : null}
            {(!Array.isArray(content.reviews) || content.reviews.filter(review => review && review.approved).length === 0) && (
              <div className="text-center py-8 bg-white border-2 border-gray-400">
                <p className="font-mono text-gray-500">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            )}
          </div>;
        break;
      case 'contact':
        title = 'Contact Us';
        newDialogContent = <div className="p-4 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
                  Send us a message
                </h3>
                <ContactForm onClose={closeDialog} />
              </div>
              <div className="lg:w-72 space-y-6 lg:border-l-2 lg:border-gray-400 lg:pl-6">
                <div>
                  <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                    {/* Office Hours */}
                    <div className="p-4 bg-white border-2 border-gray-400">
                      <div className="font-mono font-bold mb-2">
                        Office Hours
                      </div>
                      <div className="font-mono text-sm space-y-1">
                        {content.contact?.officeHours ? (
                          <div className="whitespace-pre-line">
                            <div>{content.contact.officeHours.days}</div>
                            <div>{content.contact.officeHours.hours}</div>
                            <div>Timezone: {content.contact.officeHours.timezone}</div>
                          </div>
                        ) : (
                          <>
                            <div>Monday - Friday</div>
                            <div>9:00 AM - 6:00 PM (GMT+6)</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Phone & WhatsApp */}
                    <div className="p-4 bg-white border-2 border-gray-400">
                      <div className="font-mono font-bold mb-2">
                        Phone & WhatsApp
                      </div>
                      <div className="font-mono text-sm space-y-2">
                        {content.contact?.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {content.contact.phone}
                          </div>
                        )}
                        {content.contact?.whatsapp && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                              <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                              <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
                            </svg>
                            {content.contact.whatsapp}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="p-4 bg-white border-2 border-gray-400">
                      <div className="font-mono font-bold mb-2">Email</div>
                      <div className="font-mono text-sm">
                        {content.contact?.email ? (
                          <a href={`mailto:${content.contact.email}`} className="text-blue-700 hover:underline">
                            {content.contact.email}
                          </a>
                        ) : (
                          <a href="mailto:contract.toiral@gmail.com" className="text-blue-700 hover:underline">
                            contract.toiral@gmail.com
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="p-4 bg-white border-2 border-gray-400">
                      <div className="font-mono font-bold mb-2">
                        Social Media
                      </div>
                      <div className="font-mono text-sm space-y-2">
                        {Array.isArray(content.contact?.socialMedia) ? (
                          // New format - array of social media links
                          content.contact.socialMedia.map((item, index) => (
                            <a
                              key={item.id || index}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-700 hover:underline"
                            >
                              {/* Render icon based on platform */}
                              {item.icon === 'facebook' ? (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png" alt="Facebook" className="w-4 h-4 mr-2" />
                              ) : item.icon === 'instagram' ? (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png" alt="Instagram" className="w-4 h-4 mr-2" />
                              ) : item.icon === 'twitter' ? (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png" alt="Twitter" className="w-4 h-4 mr-2" />
                              ) : item.icon === 'linkedin' ? (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" alt="LinkedIn" className="w-4 h-4 mr-2" />
                              ) : item.icon === 'youtube' ? (
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/800px-YouTube_full-color_icon_%282017%29.svg.png" alt="YouTube" className="w-4 h-4 mr-2" />
                              ) : (
                                <img src="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EIcon%3C%2Ftext%3E%3C%2Fsvg%3E" alt={item.platform} className="w-4 h-4 mr-2" />
                              )}
                              {item.platform}
                            </a>
                          ))
                        ) : (
                          // Old format - object with platform keys
                          // Using type assertion to avoid TypeScript errors
                          <>
                            {content.contact?.socialMedia && typeof content.contact.socialMedia === 'object' &&
                             'facebook' in (content.contact.socialMedia as any) && (content.contact.socialMedia as any).facebook && (
                              <a
                                href={(content.contact.socialMedia as any).facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-700 hover:underline"
                              >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png" alt="Facebook" className="w-4 h-4 mr-2" />
                                Facebook
                              </a>
                            )}
                            {content.contact?.socialMedia && typeof content.contact.socialMedia === 'object' &&
                             'instagram' in (content.contact.socialMedia as any) && (content.contact.socialMedia as any).instagram && (
                              <a
                                href={(content.contact.socialMedia as any).instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-700 hover:underline"
                              >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png" alt="Instagram" className="w-4 h-4 mr-2" />
                                Instagram
                              </a>
                            )}
                            {content.contact?.socialMedia && typeof content.contact.socialMedia === 'object' &&
                             'twitter' in (content.contact.socialMedia as any) && (content.contact.socialMedia as any).twitter && (
                              <a
                                href={(content.contact.socialMedia as any).twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-700 hover:underline"
                              >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png" alt="Twitter" className="w-4 h-4 mr-2" />
                                Twitter
                              </a>
                            )}
                            {content.contact?.socialMedia && typeof content.contact.socialMedia === 'object' &&
                             'linkedin' in (content.contact.socialMedia as any) && (content.contact.socialMedia as any).linkedin && (
                              <a
                                href={(content.contact.socialMedia as any).linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-700 hover:underline"
                              >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" alt="LinkedIn" className="w-4 h-4 mr-2" />
                                LinkedIn
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>;
        break;
      case 'book':
        title = 'Appointments';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <AppointmentManager />
          </Suspense>
        );
        break;
      case 'chat':
        title = 'Live Chat Support';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <ChatBox onClose={closeDialog} />
          </Suspense>
        );
        break;
      case 'reversi':
        title = 'Reversi Game';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <GameWindow gameType="reversi" />
          </Suspense>
        );
        break;
      case 'checkers':
        title = 'Checkers Game';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <GameWindow gameType="checkers" />
          </Suspense>
        );
        break;

      case 'pricing':
        title = 'Pricing';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <PricingSection />
          </Suspense>
        );
        break;

      case 'games':
        title = content?.games?.title || 'Games';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <GamesSection />
          </Suspense>
        );
        break;

      case 'community':
        title = 'Community Forum';
        newDialogContent = (
          <Suspense fallback={<DialogLoadingFallback />}>
            <CommunityForum />
          </Suspense>
        );
        break;

      case 'imagetest':
        title = 'Image Loading Test';
        newDialogContent = <ImageLoadingTest />;
        break;

      // Handle dynamic games from the database
      default:
        // Check if this is a game ID from our database
        if (content?.games?.games) {
          const game = content.games.games.find(g => g.id === id);
          if (game) {
            title = game.name;
            newDialogContent = (
              <Suspense fallback={<DialogLoadingFallback />}>
                <GameWindow gameId={game.id} />
              </Suspense>
            );
            break;
          }
        }
        break;
    }
    if (title && newDialogContent) {
      openDialog(id, title, newDialogContent);
    }
  };
  const openDialog = (id: string, title: string, content: React.ReactNode) => {
    if (!content) return;
    setActiveDialog(id);
    setDialogTitle(title);
    setDialogContent(content);
  };
  const closeDialog = () => {
    setActiveDialog(null);
    setDialogTitle('');
    setDialogContent(null);
  };
  if (isThemeLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-200">
        <div className="text-center">
          <LoaderIcon className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="font-mono text-gray-700 text-lg">Loading theme settings...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="w-full h-screen flex flex-col overflow-hidden relative" style={{
      backgroundColor: settings.backgroundColor,
      backgroundImage: settings.useBackgroundImage && settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>

      <div className="flex-grow flex flex-col relative">
        {settings.desktopIcons.visible && <div className="absolute top-0 left-0 right-0 md:right-auto z-10 desktop-icons">
            <div className="flex flex-row flex-wrap md:flex-col items-center md:items-start p-4 gap-2 md:gap-4 justify-center md:justify-start">
              {/* Sections from theme settings (excluding startMenuOnly sections) */}
              {settings.sections
                .filter(section => section.visible && !section.startMenuOnly)
                .sort((a, b) => a.order - b.order)
                .map(section => (
                  <DesktopIcon
                    key={section.id}
                    id={section.id} // Pass the section ID to the DesktopIcon component
                    data-icon={section.id} // Add data-icon attribute for easier selection
                    icon={
                      <LazyImage
                        src={section.icon}
                        alt={section.label}
                        className={`
                          ${settings.desktopIcons.size === 'small' ? 'w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8' :
                            settings.desktopIcons.size === 'medium' ? 'w-8 h-8 sm:w-10 sm:h-10 md:w-10 md:h-10' :
                            'w-10 h-10 sm:w-12 sm:h-12 md:w-12 md:h-12'}
                          object-contain transition-transform duration-200 group-hover:scale-105 touch-feedback
                        `}
                        placeholderSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EIcon%3C%2Ftext%3E%3C%2Fsvg%3E"
                        zoomable={false}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EIcon%3C%2Ftext%3E%3C%2Fsvg%3E";
                        }}
                      />
                    }
                    label={section.label}
                    onClick={() => handleIconClick(section.id)}
                  />
                ))
              }
            </div>
          </div>}
        <div className="flex-grow flex items-center justify-center">
          {settings.clockVisible && <EnhancedClock />}
        </div>
      </div>
      <Taskbar
        onChatClick={() => handleIconClick('chat')}
        onBookClick={() => handleIconClick('book')}
        onAboutClick={() => handleIconClick('about')}
        onPortfolioClick={() => handleIconClick('portfolio')}
        onReviewsClick={() => handleIconClick('reviews')}
        onContactClick={() => handleIconClick('contact')}
        onUserProfileClick={() => handleIconClick('userProfile')}
        onPricingClick={() => handleIconClick('pricing')}
        onGamesClick={() => handleIconClick('games')}
        onCommunityClick={() => handleIconClick('community')}
        onSignInClick={() => handleIconClick('signIn')}
        onDatabaseClick={() => {}}
        className="taskbar"
      />

      {/* Main Dialog */}
      {activeDialog && dialogContent && (
        <DialogWindow
          title={dialogTitle}
          onClose={closeDialog}
          style={{
            width: settings.dialogDefaultWidth
          }}
        >
          {dialogContent}
        </DialogWindow>
      )}

      {/* Login Dialog */}
      {showLoginDialog && (
        <DialogWindow
          title="Sign In"
          onClose={() => setShowLoginDialog(false)}
          style={{
            width: 400
          }}
        >
          <UserLogin
            onClose={() => setShowLoginDialog(false)}
            onSuccess={() => {
              setShowLoginDialog(false);
              // If user was trying to book, open booking dialog after login
              if (activeDialog === 'book') {
                handleIconClick('book');
              }
            }}
          />
        </DialogWindow>
      )}

      {/* Firebase Auth Diagnostic Dialog */}
      {showDiagnosticDialog && (
        <DialogWindow
          title="Firebase Authentication Diagnostic"
          onClose={() => setShowDiagnosticDialog(false)}
          style={{
            width: 600
          }}
        >
          <Suspense fallback={<DialogLoadingFallback />}>
            <FirebaseAuthDiagnostic
              onClose={() => setShowDiagnosticDialog(false)}
            />
          </Suspense>
        </DialogWindow>
      )}
    </div>
  );
}