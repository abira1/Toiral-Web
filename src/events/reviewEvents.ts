/**
 * Review Events System
 * 
 * This module provides a custom event system for real-time communication
 * between the TestimonialManager and TestimonialsSection components.
 */

// Define event types
export type ReviewEventType = 
  | 'review_approved'
  | 'review_featured'
  | 'review_unfeatured'
  | 'review_deleted'
  | 'review_updated'
  | 'reviews_refreshed';

// Define event data structure
export interface ReviewEventData {
  reviewId?: string;
  approved?: boolean;
  featured?: boolean;
  timestamp: number;
  source: string;
}

// Custom event name
const REVIEW_EVENT_NAME = 'toiral_review_event';

/**
 * Dispatch a review event to notify other components about changes
 */
export const dispatchReviewEvent = (type: ReviewEventType, data: Omit<ReviewEventData, 'timestamp'>) => {
  const eventData: ReviewEventData = {
    ...data,
    timestamp: Date.now()
  };
  
  console.log(`%c[TOIRAL EVENT] Dispatching review event: ${type}`, 'background: #9b59b6; color: white; padding: 2px 5px; border-radius: 3px;', eventData);
  
  // Create and dispatch the custom event
  const event = new CustomEvent(REVIEW_EVENT_NAME, {
    detail: {
      type,
      data: eventData
    }
  });
  
  window.dispatchEvent(event);
};

/**
 * Subscribe to review events
 * @returns A function to unsubscribe from events
 */
export const subscribeToReviewEvents = (
  callback: (type: ReviewEventType, data: ReviewEventData) => void
) => {
  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { type, data } = customEvent.detail;
    
    console.log(`%c[TOIRAL EVENT] Received review event: ${type}`, 'background: #9b59b6; color: white; padding: 2px 5px; border-radius: 3px;', data);
    
    callback(type, data);
  };
  
  // Add event listener
  window.addEventListener(REVIEW_EVENT_NAME, handleEvent);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener(REVIEW_EVENT_NAME, handleEvent);
  };
};
