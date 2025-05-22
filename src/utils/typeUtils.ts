/**
 * Type utilities for handling type conversions and validations
 */

import { 
  BookingSubmission, 
  ContactFormSubmission, 
  ChatMessage, 
  Notification 
} from '../types';

/**
 * Type guard to check if a string is a valid booking status
 * @param status The status string to validate
 * @returns True if the status is valid
 */
export function isValidBookingStatus(status: string): status is BookingSubmission['status'] {
  return status === 'pending' || status === 'approved' || status === 'rejected';
}

/**
 * Validates and converts a booking status string to the correct enum value
 * @param status The status string to validate
 * @returns A valid BookingSubmission status
 */
export function validateBookingStatus(status: string): BookingSubmission['status'] {
  if (isValidBookingStatus(status)) {
    return status;
  }
  // Default to pending if invalid status
  console.warn(`Invalid booking status: ${status}, defaulting to 'pending'`);
  return 'pending';
}

/**
 * Safely converts a raw booking object to a valid BookingSubmission
 * @param booking The raw booking object from Firebase
 * @returns A valid BookingSubmission object
 */
export function toValidBookingSubmission(booking: any): BookingSubmission {
  // Ensure we have a valid object to work with
  const safeBooking = booking || {};
  
  // Validate the status field
  let status: BookingSubmission['status'] = 'pending';
  if (typeof safeBooking.status === 'string') {
    status = validateBookingStatus(safeBooking.status);
  }
  
  return {
    id: safeBooking.id || '',
    firstName: safeBooking.firstName || '',
    lastName: safeBooking.lastName || '',
    email: safeBooking.email || '',
    phone: safeBooking.phone || '',
    serviceType: safeBooking.serviceType || '',
    date: safeBooking.date || '',
    time: safeBooking.time || '',
    description: safeBooking.description || '',
    status: status,
    submittedAt: safeBooking.submittedAt || new Date().toISOString(),
    userId: safeBooking.userId
  };
}

/**
 * Type guard to check if an object is a valid BookingSubmission
 * @param obj The object to check
 * @returns True if the object is a valid BookingSubmission
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
    isValidBookingStatus(obj.status) &&
    typeof obj.submittedAt === 'string'
  );
}

/**
 * Type guard to check if a string is a valid contact form status
 */
export function isValidContactStatus(status: string): status is ContactFormSubmission['status'] {
  return status === 'new' || status === 'read' || status === 'replied';
}

/**
 * Validates and converts a contact status string to the correct enum value
 */
export function validateContactStatus(status: string): ContactFormSubmission['status'] {
  if (isValidContactStatus(status)) {
    return status;
  }
  console.warn(`Invalid contact status: ${status}, defaulting to 'new'`);
  return 'new';
}

/**
 * Type guard to check if a string is a valid chat message status
 */
export function isValidChatMessageStatus(status: string): status is ChatMessage['status'] {
  return status === 'new' || status === 'replied';
}

/**
 * Validates and converts a chat message status string to the correct enum value
 */
export function validateChatMessageStatus(status: string): ChatMessage['status'] {
  if (isValidChatMessageStatus(status)) {
    return status;
  }
  console.warn(`Invalid chat message status: ${status}, defaulting to 'new'`);
  return 'new';
}

/**
 * Type guard to check if a string is a valid notification type
 */
export function isValidNotificationType(type: string): type is Notification['type'] {
  return type === 'review' || type === 'contact' || type === 'booking';
}

/**
 * Validates and converts a notification type string to the correct enum value
 */
export function validateNotificationType(type: string): Notification['type'] {
  if (isValidNotificationType(type)) {
    return type;
  }
  console.warn(`Invalid notification type: ${type}, defaulting to 'booking'`);
  return 'booking';
}

/**
 * Safely converts a raw contact form submission to a valid ContactFormSubmission
 */
export function toValidContactFormSubmission(submission: any): ContactFormSubmission {
  const safeSubmission = submission || {};
  
  let status: ContactFormSubmission['status'] = 'new';
  if (typeof safeSubmission.status === 'string') {
    status = validateContactStatus(safeSubmission.status);
  }
  
  return {
    id: safeSubmission.id || '',
    name: safeSubmission.name || '',
    email: safeSubmission.email || '',
    subject: safeSubmission.subject || '',
    message: safeSubmission.message || '',
    status: status,
    submittedAt: safeSubmission.submittedAt || new Date().toISOString()
  };
}

/**
 * Safely converts a raw chat message to a valid ChatMessage
 */
export function toValidChatMessage(message: any): ChatMessage {
  const safeMessage = message || {};
  
  let status: ChatMessage['status'] = 'new';
  if (typeof safeMessage.status === 'string') {
    status = validateChatMessageStatus(safeMessage.status);
  }
  
  return {
    id: safeMessage.id || '',
    name: safeMessage.name || '',
    email: safeMessage.email || '',
    message: safeMessage.message || '',
    timestamp: safeMessage.timestamp || new Date().toISOString(),
    status: status,
    subject: safeMessage.subject,
    role: safeMessage.role as ChatMessage['role'] | undefined,
    content: safeMessage.content
  };
}

/**
 * Safely converts a raw notification to a valid Notification
 */
export function toValidNotification(notification: any): Notification {
  const safeNotification = notification || {};
  
  let type: Notification['type'] = 'booking';
  if (typeof safeNotification.type === 'string') {
    type = validateNotificationType(safeNotification.type);
  }
  
  return {
    id: safeNotification.id || '',
    type: type,
    title: safeNotification.title || '',
    message: safeNotification.message || '',
    timestamp: safeNotification.timestamp || new Date().toISOString(),
    read: !!safeNotification.read,
    sourceId: safeNotification.sourceId || '',
    userName: safeNotification.userName
  };
}