import { ref, set, get, update, remove, onValue } from 'firebase/database';
import { database } from './config';
import { v4 as uuidv4 } from 'uuid';

// Define the types locally instead of importing from ContentContext
interface Notification {
  id: string;
  type: 'review' | 'contact' | 'booking';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  sourceId: string;
  userName?: string;
}

interface NotificationsMap {
  [key: string]: Notification;
}

// Types
interface BookingSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  userId?: string; // User ID from Firebase Auth
  selectedPackage?: string; // Optional package selection
}

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
}

interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  submittedAt: string;
}

interface ChatMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: 'new' | 'replied';
}

// Bookings
export const addBooking = async (bookingData: Omit<BookingSubmission, 'id' | 'status' | 'submittedAt'>) => {
  try {
    const bookingId = uuidv4();
    const newBooking: BookingSubmission = {
      ...bookingData,
      id: bookingId,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // Add the booking to Firebase
    await set(ref(database, `bookings/${bookingId}`), newBooking);

    // Create a notification for the new booking
    let notificationMessage = `${bookingData.firstName} ${bookingData.lastName} requested a ${bookingData.serviceType} appointment`;

    // Add package information to the notification if available
    if ('selectedPackage' in bookingData && bookingData.selectedPackage) {
      notificationMessage += ` (Package: ${bookingData.selectedPackage})`;
    }

    await addNotification({
      type: 'booking',
      title: 'New Appointment Request',
      message: notificationMessage,
      sourceId: bookingId,
      userName: `${bookingData.firstName} ${bookingData.lastName}`
    });

    return bookingId;
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
};

export const getBookings = async () => {
  try {
    const snapshot = await get(ref(database, 'bookings'));
    if (snapshot.exists()) {
      const bookingsData = snapshot.val();
      return Object.values(bookingsData) as BookingSubmission[];
    }
    return [];
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    await update(ref(database, `bookings/${bookingId}`), { status });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const subscribeToBookings = (callback: (bookings: BookingSubmission[]) => void, userId?: string) => {
  console.log('Subscribing to bookings. User ID filter:', userId ? 'Yes' : 'No (admin view)');
  const bookingsRef = ref(database, 'bookings');

  return onValue(bookingsRef, (snapshot) => {
    if (snapshot.exists()) {
      const bookingsData = snapshot.val();
      let bookingsArray = Object.values(bookingsData) as BookingSubmission[];

      console.log('Raw bookings count:', bookingsArray.length);

      // If userId is provided, filter bookings to only show the user's bookings
      if (userId) {
        bookingsArray = bookingsArray.filter(booking => {
          const isUserBooking = booking.userId === userId ||
            // For backward compatibility with existing bookings that don't have userId
            (booking.userId === undefined && booking.email === userId);

          return isUserBooking;
        });
        console.log('Filtered bookings for user:', bookingsArray.length);
      } else {
        console.log('Showing all bookings (admin view)');
      }

      callback(bookingsArray);
    } else {
      console.log('No bookings found in database');
      callback([]);
    }
  });
};

// Reviews
export const addReview = async (reviewData: Omit<Review, 'id' | 'approved' | 'date'>) => {
  try {
    const reviewId = uuidv4();
    const newReview: Review = {
      ...reviewData,
      id: reviewId,
      approved: false,
      date: new Date().toISOString()
    };

    // Add the review to Firebase
    await set(ref(database, `reviews/${reviewId}`), newReview);

    // Create a notification for the new review
    await addNotification({
      type: 'review',
      title: 'New Review Submitted',
      message: `${reviewData.name} left a ${reviewData.rating}-star review`,
      sourceId: reviewId,
      userName: reviewData.name
    });

    return reviewId;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviews = async () => {
  try {
    const snapshot = await get(ref(database, 'reviews'));
    if (snapshot.exists()) {
      const reviewsData = snapshot.val();
      return Object.values(reviewsData) as Review[];
    }
    return [];
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
};

export const updateReviewApproval = async (reviewId: string, approved: boolean) => {
  try {
    await update(ref(database, `reviews/${reviewId}`), { approved });
  } catch (error) {
    console.error('Error updating review approval:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    await remove(ref(database, `reviews/${reviewId}`));
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const subscribeToReviews = (callback: (reviews: Review[]) => void) => {
  const reviewsRef = ref(database, 'reviews');
  return onValue(reviewsRef, (snapshot) => {
    if (snapshot.exists()) {
      const reviewsData = snapshot.val();
      const reviewsArray = Object.values(reviewsData) as Review[];
      callback(reviewsArray);
    } else {
      callback([]);
    }
  });
};

// Contact Form Submissions
export const addContactSubmission = async (contactData: { name: string; email: string; subject: string; message: string; }) => {
  try {
    const contactId = uuidv4();
    const newContact: ContactFormSubmission = {
      ...contactData,
      id: contactId,
      status: 'new',
      submittedAt: new Date().toISOString()
    };

    // Add the contact submission to Firebase
    await set(ref(database, `contactSubmissions/${contactId}`), newContact);

    // Create a notification for the new contact submission
    await addNotification({
      type: 'contact',
      title: 'New Contact Message',
      message: `${contactData.name}: ${contactData.subject}`,
      sourceId: contactId,
      userName: contactData.name
    });

    return contactId;
  } catch (error) {
    console.error('Error adding contact submission:', error);
    throw error;
  }
};

export const getContactSubmissions = async () => {
  try {
    const snapshot = await get(ref(database, 'contactSubmissions'));
    if (snapshot.exists()) {
      const contactData = snapshot.val();
      return Object.values(contactData) as ContactFormSubmission[];
    }
    return [];
  } catch (error) {
    console.error('Error getting contact submissions:', error);
    throw error;
  }
};

export const updateContactStatus = async (contactId: string, status: 'new' | 'read' | 'replied') => {
  try {
    await update(ref(database, `contactSubmissions/${contactId}`), { status });
  } catch (error) {
    console.error('Error updating contact status:', error);
    throw error;
  }
};

export const deleteContactSubmission = async (contactId: string) => {
  try {
    await remove(ref(database, `contactSubmissions/${contactId}`));
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    throw error;
  }
};

export const subscribeToContactSubmissions = (callback: (contacts: ContactFormSubmission[]) => void) => {
  const contactsRef = ref(database, 'contactSubmissions');
  return onValue(contactsRef, (snapshot) => {
    if (snapshot.exists()) {
      const contactsData = snapshot.val();
      const contactsArray = Object.values(contactsData) as ContactFormSubmission[];
      callback(contactsArray);
    } else {
      callback([]);
    }
  });
};

// Chat Messages
export const addChatMessage = async (chatData: { name: string; email: string; message: string; }) => {
  try {
    const chatId = uuidv4();
    const newChat: ChatMessage = {
      ...chatData,
      id: chatId,
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    await set(ref(database, `chatMessages/${chatId}`), newChat);
    return chatId;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

export const getChatMessages = async () => {
  try {
    const snapshot = await get(ref(database, 'chatMessages'));
    if (snapshot.exists()) {
      const chatData = snapshot.val();
      return Object.values(chatData) as ChatMessage[];
    }
    return [];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

export const updateChatMessageStatus = async (chatId: string, status: 'new' | 'replied') => {
  try {
    await update(ref(database, `chatMessages/${chatId}`), { status });
  } catch (error) {
    console.error('Error updating chat message status:', error);
    throw error;
  }
};

export const subscribeToChatMessages = (callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = ref(database, 'chatMessages');
  return onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const messagesData = snapshot.val();
      const messagesArray = Object.values(messagesData) as ChatMessage[];
      callback(messagesArray);
    } else {
      callback([]);
    }
  });
};

// Company Settings
export const updateCompanySettings = async (settings: any) => {
  try {
    await set(ref(database, 'company'), settings);
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw error;
  }
};

export const getCompanySettings = async () => {
  try {
    const snapshot = await get(ref(database, 'company'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting company settings:', error);
    throw error;
  }
};

export const subscribeToCompanySettings = (callback: (settings: any) => void) => {
  const settingsRef = ref(database, 'company');
  return onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  });
};

// Notification functions

// Add a notification
export const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
  try {
    const notificationId = uuidv4();
    const newNotification: Notification = {
      ...notificationData,
      id: notificationId,
      timestamp: new Date().toISOString(),
      read: false
    };

    await set(ref(database, `notifications/${notificationId}`), newNotification);
    return notificationId;
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

// Get all notifications
export const getNotifications = async (): Promise<NotificationsMap> => {
  try {
    const snapshot = await get(ref(database, 'notifications'));
    if (snapshot.exists()) {
      return snapshot.val() as NotificationsMap;
    }
    return {};
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Update notification read status
export const updateNotificationReadStatus = async (notificationId: string, read: boolean) => {
  try {
    await update(ref(database, `notifications/${notificationId}`), { read });
  } catch (error) {
    console.error('Error updating notification read status:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  try {
    await remove(ref(database, `notifications/${notificationId}`));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    await set(ref(database, 'notifications'), {});
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
};

// Subscribe to notifications
export const subscribeToNotifications = (callback: (notifications: NotificationsMap) => void) => {
  const notificationsRef = ref(database, 'notifications');
  return onValue(notificationsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as NotificationsMap);
    } else {
      callback({});
    }
  });
};
