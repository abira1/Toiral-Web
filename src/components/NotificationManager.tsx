import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Win95Button } from './Win95Button';
import { 
  AlertTriangleIcon,
  BellIcon, 
  CheckIcon, 
  EyeIcon, 
  EyeOffIcon, 
  FilterIcon, 
  LoaderIcon, 
  MessageSquareIcon, 
  StarIcon, 
  CalendarIcon, 
  ClockIcon,
  RefreshCwIcon,
  XIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification, NotificationsMap } from '../contexts/ContentContext';

// Define notification types
export type NotificationType = 'review' | 'contact' | 'booking';

export function NotificationManager() {
  const { content, updateNotificationStatus, clearAllNotifications } = useContent();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Initialize component
  useEffect(() => {
    const initComponent = async () => {
      try {
        // Check if notifications is available
        if (!content || content.notifications === undefined) {
          setError('Notifications data is not available');
          setIsLoading(false);
          return;
        }
        
        if (typeof content.notifications !== 'object' || content.notifications === null) {
          setError('Notifications data is not in the expected format');
          setIsLoading(false);
          return;
        }
        
        // If we get here, notifications is an object
        setError(null);
        // Loading state will be updated in the other useEffect
      } catch (err) {
        console.error('Error initializing NotificationManager:', err);
        setError('Failed to initialize notifications');
        setIsLoading(false);
      }
    };
    
    initComponent();
  }, [content]);

  // Initialize notifications from content
  useEffect(() => {
    if (content.notifications && typeof content.notifications === 'object') {
      // Convert notifications object to array and sort by timestamp (newest first)
      const notificationsArray = Object.values(content.notifications);
      const sortedNotifications = notificationsArray.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setNotifications(sortedNotifications);
      setIsLoading(false);
    } else {
      // If notifications is not an object or is empty, set to empty array
      setNotifications([]);
      setIsLoading(false);
    }
  }, [content.notifications]);

  // Apply filters to notifications
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filter !== 'all' && notification.type !== filter) {
      return false;
    }
    
    // Filter by read status
    if (readFilter === 'read' && !notification.read) {
      return false;
    }
    if (readFilter === 'unread' && notification.read) {
      return false;
    }
    
    return true;
  });

  // Mark notification as read
  const markAsRead = (id: string) => {
    setIsLoading(true);
    updateNotificationStatus(id, true)
      .finally(() => setIsLoading(false));
  };

  // Mark notification as unread
  const markAsUnread = (id: string) => {
    setIsLoading(true);
    updateNotificationStatus(id, false)
      .finally(() => setIsLoading(false));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setIsLoading(true);
    
    // Get IDs of all unread notifications that match the current filter
    const unreadIds = filteredNotifications
      .filter(n => !n.read)
      .map(n => n.id);
    
    if (unreadIds.length === 0) {
      setIsLoading(false);
      return;
    }
    
    // Update each notification
    Promise.all(unreadIds.map(id => updateNotificationStatus(id, true)))
      .finally(() => setIsLoading(false));
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
      setIsLoading(true);
      clearAllNotifications()
        .finally(() => setIsLoading(false));
    }
  };

  // View notification details
  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    
    // Mark as read if it's unread
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'review':
        return <StarIcon className="w-5 h-5 text-yellow-500" />;
      case 'contact':
        return <MessageSquareIcon className="w-5 h-5 text-blue-500" />;
      case 'booking':
        return <CalendarIcon className="w-5 h-5 text-green-500" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get notification source details
  const getSourceDetails = (notification: Notification) => {
    if (!notification) return null;
    
    switch (notification.type) {
      case 'review':
        const review = Array.isArray(content.reviews) ? 
          content.reviews.find(r => r.id === notification.sourceId) : undefined;
        
        if (review) {
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Rating:</span>
                <div className="text-yellow-500">
                  {'★'.repeat(Math.min(Math.max(review.rating || 0, 0), 5))}
                  {'☆'.repeat(5 - Math.min(Math.max(review.rating || 0, 0), 5))}
                </div>
              </div>
              <div>
                <span className="font-mono font-bold">Review:</span>
                <p className="font-mono mt-1 p-2 bg-gray-100 border border-gray-300 rounded whitespace-pre-wrap">
                  {review.review}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Status:</span>
                <span className={`font-mono ${review.approved ? 'text-green-600' : 'text-orange-600'}`}>
                  {review.approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded">
              <p className="font-mono text-gray-500 italic">This review may have been deleted or is no longer available.</p>
            </div>
          );
        }
        
      case 'contact':
        const contact = Array.isArray(content.contactSubmissions) ? 
          content.contactSubmissions.find(c => c.id === notification.sourceId) : undefined;
        
        if (contact) {
          return (
            <div className="space-y-2">
              <div>
                <span className="font-mono font-bold">Subject:</span>
                <p className="font-mono">{contact.subject}</p>
              </div>
              <div>
                <span className="font-mono font-bold">Message:</span>
                <p className="font-mono mt-1 p-2 bg-gray-100 border border-gray-300 rounded whitespace-pre-wrap">
                  {contact.message}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Email:</span>
                <a href={`mailto:${contact.email}`} className="font-mono text-blue-600 hover:underline">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Status:</span>
                <span className="font-mono">
                  {contact.status === 'new' ? 'New' : 
                   contact.status === 'read' ? 'Read' : 'Replied'}
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded">
              <p className="font-mono text-gray-500 italic">This contact message may have been deleted or is no longer available.</p>
            </div>
          );
        }
        
      case 'booking':
        const booking = Array.isArray(content.bookings) ? 
          content.bookings.find(b => b.id === notification.sourceId) : undefined;
        
        if (booking) {
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Service:</span>
                <span className="font-mono">{booking.serviceType}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Date:</span>
                <span className="font-mono">{booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Time:</span>
                <span className="font-mono">{booking.time}</span>
              </div>
              <div>
                <span className="font-mono font-bold">Description:</span>
                <p className="font-mono mt-1 p-2 bg-gray-100 border border-gray-300 rounded whitespace-pre-wrap">
                  {booking.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Contact:</span>
                <a href={`mailto:${booking.email}`} className="font-mono text-blue-600 hover:underline">
                  {booking.email}
                </a>
                <span className="font-mono">|</span>
                <span className="font-mono">{booking.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">Status:</span>
                <span className={`font-mono ${
                  booking.status === 'approved' ? 'text-green-600' : 
                  booking.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div className="p-4 bg-gray-100 border border-gray-300 rounded">
              <p className="font-mono text-gray-500 italic">This booking may have been deleted or is no longer available.</p>
            </div>
          );
        }
    }
    
    return <p className="font-mono text-gray-500 italic">Source details not available</p>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoaderIcon className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="font-mono text-gray-700">Loading notifications...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangleIcon className="w-10 h-10 mx-auto mb-4 text-red-500" />
            <p className="font-mono text-gray-700 mb-2">{error}</p>
            <p className="font-mono text-gray-500 text-sm mb-4">
              Please try refreshing the page or contact support if the issue persists.
            </p>
            <Win95Button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1 font-mono text-sm"
            >
              <RefreshCwIcon className="w-4 h-4 inline-block mr-1" />
              Refresh Page
            </Win95Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (typeof content.notifications !== 'object' || content.notifications === null) {
    return (
      <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BellIcon className="w-10 h-10 mx-auto mb-4 text-gray-400" />
            <p className="font-mono text-gray-700">Notifications system is initializing...</p>
            <Win95Button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1 font-mono text-sm mt-4"
            >
              <RefreshCwIcon className="w-4 h-4 inline-block mr-1" />
              Refresh
            </Win95Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-between mb-6 border-b-2 border-gray-400 pb-2">
          <h3 className="font-mono font-bold text-lg flex items-center">
            <BellIcon className="w-5 h-5 mr-2" />
            Notifications
          </h3>
          <div className="flex gap-2">
            <Win95Button 
              onClick={markAllAsRead} 
              className="px-3 py-1 font-mono text-sm"
              disabled={!filteredNotifications.some(n => !n.read)}
            >
              <EyeIcon className="w-4 h-4 inline-block mr-1" />
              Mark All as Read
            </Win95Button>
            <Win95Button 
              onClick={handleClearAll} 
              className="px-3 py-1 font-mono text-sm"
              disabled={notifications.length === 0}
            >
              <XIcon className="w-4 h-4 inline-block mr-1" />
              Clear All
            </Win95Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-100 border-2 border-gray-300 rounded">
          <div>
            <span className="font-mono text-sm mr-2">Type:</span>
            <div className="flex gap-1 mt-1">
              <Win95Button 
                onClick={() => setFilter('all')} 
                className={`px-2 py-1 font-mono text-xs ${filter === 'all' ? 'bg-blue-100' : ''}`}
              >
                All
              </Win95Button>
              <Win95Button 
                onClick={() => setFilter('review')} 
                className={`px-2 py-1 font-mono text-xs ${filter === 'review' ? 'bg-blue-100' : ''}`}
              >
                <StarIcon className="w-3 h-3 inline-block mr-1" />
                Reviews
              </Win95Button>
              <Win95Button 
                onClick={() => setFilter('contact')} 
                className={`px-2 py-1 font-mono text-xs ${filter === 'contact' ? 'bg-blue-100' : ''}`}
              >
                <MessageSquareIcon className="w-3 h-3 inline-block mr-1" />
                Messages
              </Win95Button>
              <Win95Button 
                onClick={() => setFilter('booking')} 
                className={`px-2 py-1 font-mono text-xs ${filter === 'booking' ? 'bg-blue-100' : ''}`}
              >
                <CalendarIcon className="w-3 h-3 inline-block mr-1" />
                Bookings
              </Win95Button>
            </div>
          </div>
          
          <div className="ml-auto">
            <span className="font-mono text-sm mr-2">Status:</span>
            <div className="flex gap-1 mt-1">
              <Win95Button 
                onClick={() => setReadFilter('all')} 
                className={`px-2 py-1 font-mono text-xs ${readFilter === 'all' ? 'bg-blue-100' : ''}`}
              >
                All
              </Win95Button>
              <Win95Button 
                onClick={() => setReadFilter('unread')} 
                className={`px-2 py-1 font-mono text-xs ${readFilter === 'unread' ? 'bg-blue-100' : ''}`}
              >
                <EyeOffIcon className="w-3 h-3 inline-block mr-1" />
                Unread
              </Win95Button>
              <Win95Button 
                onClick={() => setReadFilter('read')} 
                className={`px-2 py-1 font-mono text-xs ${readFilter === 'read' ? 'bg-blue-100' : ''}`}
              >
                <EyeIcon className="w-3 h-3 inline-block mr-1" />
                Read
              </Win95Button>
            </div>
          </div>
        </div>
        
        {/* Notification List */}
        <div className="border-2 border-gray-400 rounded max-h-[500px] overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-300">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 hover:bg-gray-100 cursor-pointer flex items-start gap-3 ${
                    !notification.read ? 'bg-blue-50' : ''
                  } ${selectedNotification?.id === notification.id ? 'bg-blue-100' : ''}`}
                  onClick={() => viewNotificationDetails(notification)}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-mono text-sm font-bold truncate ${!notification.read ? 'text-blue-700' : ''}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="bg-blue-500 rounded-full w-2 h-2"></span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-gray-600 truncate">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <ClockIcon className="w-3 h-3 text-gray-500" />
                      <span className="font-mono text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div>
                    {notification.read ? (
                      <Win95Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(notification.id);
                        }} 
                        className="px-2 py-1 font-mono text-xs"
                        title="Mark as unread"
                      >
                        <EyeOffIcon className="w-3 h-3" />
                      </Win95Button>
                    ) : (
                      <Win95Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }} 
                        className="px-2 py-1 font-mono text-xs"
                        title="Mark as read"
                      >
                        <EyeIcon className="w-3 h-3" />
                      </Win95Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <BellIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="font-mono text-gray-500">No notifications found</p>
              {(filter !== 'all' || readFilter !== 'all') && (
                <Win95Button 
                  onClick={() => {
                    setFilter('all');
                    setReadFilter('all');
                  }} 
                  className="px-3 py-1 font-mono text-sm mt-2"
                >
                  <RefreshCwIcon className="w-4 h-4 inline-block mr-1" />
                  Reset Filters
                </Win95Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Details */}
      {selectedNotification && (
        <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
          <div className="flex items-center justify-between mb-4 border-b-2 border-gray-400 pb-2">
            <h3 className="font-mono font-bold text-lg flex items-center">
              {getNotificationIcon(selectedNotification.type)}
              <span className="ml-2">{selectedNotification.title}</span>
            </h3>
            <Win95Button 
              onClick={() => setSelectedNotification(null)} 
              className="px-2 py-1 font-mono text-xs"
            >
              <XIcon className="w-3 h-3" />
            </Win95Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="font-mono text-sm text-gray-600">
                {formatTimestamp(selectedNotification.timestamp)}
              </span>
            </div>
            
            <div className="p-3 bg-gray-100 border-2 border-gray-300 rounded">
              <p className="font-mono whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>
            
            <div className="border-t-2 border-gray-300 pt-4">
              <h4 className="font-mono font-bold mb-2">Details</h4>
              {getSourceDetails(selectedNotification)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}