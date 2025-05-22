/**
 * Type guards and type assertion utilities
 */

import { 
  BookingSubmission, 
  ContactFormSubmission, 
  Review, 
  Notification,
  ChatMessage
} from '../types';

/**
 * Type guard for BookingSubmission
 */
export function isBookingSubmission(obj: any): obj is BookingSubmission {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.phone === 'string' &&
    typeof obj.serviceType === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.time === 'string' &&
    typeof obj.description === 'string' &&
    (obj.status === 'pending' || obj.status === 'approved' || obj.status === 'rejected') &&
    typeof obj.submittedAt === 'string'
  );
}

/**
 * Type guard for ContactFormSubmission
 */
export function isContactFormSubmission(obj: any): obj is ContactFormSubmission {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.subject === 'string' &&
    typeof obj.message === 'string' &&
    (obj.status === 'new' || obj.status === 'read' || obj.status === 'replied') &&
    typeof obj.submittedAt === 'string'
  );
}

/**
 * Type guard for Review
 */
export function isReview(obj: any): obj is Review {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.rating === 'number' &&
    typeof obj.review === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.approved === 'boolean'
  );
}

/**
 * Type guard for Notification
 */
export function isNotification(obj: any): obj is Notification {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    (obj.type === 'review' || obj.type === 'contact' || obj.type === 'booking') &&
    typeof obj.title === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.read === 'boolean' &&
    typeof obj.sourceId === 'string'
  );
}

/**
 * Type guard for ChatMessage
 */
export function isChatMessage(obj: any): obj is ChatMessage {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.timestamp === 'string' &&
    (obj.status === 'new' || obj.status === 'replied')
  );
}

/**
 * Safely converts a booking status string to a valid BookingSubmission status
 */
export function asBookingStatus(status: string): BookingSubmission['status'] {
  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    return status;
  }
  console.warn(`Invalid booking status: ${status}, defaulting to 'pending'`);
  return 'pending';
}

/**
 * Safely converts a contact status string to a valid ContactFormSubmission status
 */
export function asContactStatus(status: string): ContactFormSubmission['status'] {
  if (status === 'new' || status === 'read' || status === 'replied') {
    return status;
  }
  console.warn(`Invalid contact status: ${status}, defaulting to 'new'`);
  return 'new';
}

/**
 * Safely converts a chat message status string to a valid ChatMessage status
 */
export function asChatMessageStatus(status: string): ChatMessage['status'] {
  if (status === 'new' || status === 'replied') {
    return status;
  }
  console.warn(`Invalid chat message status: ${status}, defaulting to 'new'`);
  return 'new';
}

/**
 * Safely converts a notification type string to a valid Notification type
 */
export function asNotificationType(type: string): Notification['type'] {
  if (type === 'review' || type === 'contact' || type === 'booking') {
    return type;
  }
  console.warn(`Invalid notification type: ${type}, defaulting to 'booking'`);
  return 'booking';
}