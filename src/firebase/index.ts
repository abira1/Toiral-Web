/**
 * Firebase module exports
 * This file centralizes all Firebase-related exports to simplify imports
 */

// Config and initialization
export { database, auth, storage, db as firestore } from './config';
export { initializeDatabase } from './initializeDatabase';
export { initializeRequiredPaths } from './initializeRequiredPaths';
export { initializeNotificationsPath } from './initializeNotifications';
export { fixNotificationsPath } from './fixNotifications';
export { fixBookingsPath, fixContactSubmissionsPath } from './fixBookingsPath';

// Database operations
export {
  addBooking,
  updateBookingStatus,
  getBookings,
  subscribeToBookings,
  addReview,
  updateReviewApproval,
  deleteReview,
  getReviews,
  subscribeToReviews,
  addContactSubmission,
  updateContactStatus,
  deleteContactSubmission,
  getContactSubmissions,
  subscribeToContactSubmissions,
  addChatMessage,
  updateChatMessageStatus,
  getChatMessages,
  subscribeToChatMessages,
  addNotification,
  updateNotificationReadStatus,
  deleteNotification,
  getNotifications,
  subscribeToNotifications,
  clearAllNotifications,
  updateCompanySettings
} from './contentDatabase';

// Notification services
export {
  sendAppointmentApprovalNotification,
  registerDeviceForNotifications
} from './notificationService';



// FCM
export {
  requestNotificationPermission,
  onForegroundMessage,
  displayNotification
} from './fcmInit';