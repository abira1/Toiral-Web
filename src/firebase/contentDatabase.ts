import { ref, set, get, update, remove, onValue } from 'firebase/database';
import { database } from './config';
import { v4 as uuidv4 } from 'uuid';
import { dispatchReviewEvent } from '../events/reviewEvents';

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
  featured?: boolean;
  position?: number;
  company?: string;
  avatar?: string;
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
export const addReview = async (reviewData: Omit<Review, 'id' | 'approved' | 'date'> & {
  userId?: string;
  userEmail?: string;
}) => {
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

    // Create a notification for the new review with enhanced information
    await addNotification({
      type: 'review',
      title: 'New Review Submitted',
      message: `${reviewData.name} left a ${reviewData.rating}-star review${reviewData.userEmail ? ` (${reviewData.userEmail})` : ''}`,
      sourceId: reviewId,
      userName: reviewData.name
    });

    console.log('Review added successfully:', {
      reviewId,
      name: reviewData.name,
      rating: reviewData.rating,
      authenticated: !!reviewData.userId
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

// Function to fix any reviews with non-boolean approval values
export const fixReviewApprovalValues = async () => {
  try {
    console.log('%c[TOIRAL DEBUG] Starting to fix review approval values...', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // Get all reviews
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      console.log('%c[TOIRAL WARNING] No reviews found to fix', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
      return { fixed: 0, total: 0 };
    }

    const reviewsData = snapshot.val();
    const reviewsArray = Object.entries(reviewsData);
    let fixedCount = 0;

    // Check each review and fix if needed
    for (const [reviewId, reviewData] of reviewsArray) {
      const review = reviewData as Review;

      // Log all reviews for debugging
      console.log('%c[TOIRAL DEBUG] Examining review:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
        reviewId, review.name, 'approved:', review.approved, 'type:', typeof review.approved);

      // Check if review is not properly approved (either not a boolean or false)
      // We need to fix both non-boolean values AND reviews that should be approved but aren't
      const shouldBeApproved =
        review.approved === true ||
        review.approved === 'true' ||
        review.approved === 1 ||
        review.approved === '1';

      // Fix if: 1) not a boolean OR 2) should be approved but isn't
      if (typeof review.approved !== 'boolean' || (shouldBeApproved && review.approved !== true)) {
        console.log('%c[TOIRAL DEBUG] Found review that needs fixing:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
          reviewId, review.name, 'approved:', review.approved, 'type:', typeof review.approved);

        // Update the review - force to true if it should be approved
        const reviewRef = ref(database, `reviews/${reviewId}`);
        await update(reviewRef, { approved: true });

        console.log('%c[TOIRAL SUCCESS] Fixed review approval value:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
          reviewId, review.name, 'from:', review.approved, 'to:', true);

        fixedCount++;
      }
    }

    console.log('%c[TOIRAL SUCCESS] Fixed review approval values:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
      fixedCount, 'out of', reviewsArray.length);

    return { fixed: fixedCount, total: reviewsArray.length };
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error fixing review approval values:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

// Function to force approve all reviews in the database
export const forceApproveAllReviews = async () => {
  try {
    console.log('%c[TOIRAL DEBUG] Starting to force approve all reviews...', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // Get all reviews
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      console.log('%c[TOIRAL WARNING] No reviews found to approve', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
      return { approved: 0, total: 0 };
    }

    const reviewsData = snapshot.val();
    const reviewsArray = Object.entries(reviewsData);
    let approvedCount = 0;

    // Approve each review
    for (const [reviewId, reviewData] of reviewsArray) {
      const review = reviewData as Review;

      console.log('%c[TOIRAL DEBUG] Force approving review:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
        reviewId, review.name, 'current approval:', review.approved);

      // Update the review to be approved
      const reviewRef = ref(database, `reviews/${reviewId}`);
      await update(reviewRef, { approved: true });

      console.log('%c[TOIRAL SUCCESS] Force approved review:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
        reviewId, review.name);

      approvedCount++;
    }

    console.log('%c[TOIRAL SUCCESS] Force approved all reviews:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
      approvedCount, 'out of', reviewsArray.length);

    return { approved: approvedCount, total: reviewsArray.length };
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error force approving reviews:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

// Function to fix reviews with missing text
export const fixReviewsWithMissingText = async () => {
  try {
    console.log('%c[TOIRAL DEBUG] Starting to fix reviews with missing text...', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // Get all reviews
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      console.log('%c[TOIRAL WARNING] No reviews found to fix', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
      return { fixed: 0, total: 0 };
    }

    const reviewsData = snapshot.val();
    const reviewsArray = Object.entries(reviewsData);
    let fixedCount = 0;

    // Check each review and fix if needed
    for (const [reviewId, reviewData] of reviewsArray) {
      const review = reviewData as Review;

      // Check if review text is missing or empty
      if (!review.review || review.review.trim() === '') {
        console.log('%c[TOIRAL DEBUG] Found review with missing text:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
          reviewId, review.name);

        // Add a default review text
        const defaultReviewText = `${review.name} had a great experience and gave us ${review.rating} stars.`;

        // Update the review
        const reviewRef = ref(database, `reviews/${reviewId}`);
        await update(reviewRef, { review: defaultReviewText });

        console.log('%c[TOIRAL SUCCESS] Fixed review with missing text:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
          reviewId, review.name, 'added default text:', defaultReviewText);

        fixedCount++;
      }
    }

    console.log('%c[TOIRAL SUCCESS] Fixed reviews with missing text:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
      fixedCount, 'out of', reviewsArray.length);

    return { fixed: fixedCount, total: reviewsArray.length };
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error fixing reviews with missing text:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

// Function to comprehensively fix all issues with reviews
export const fixAllReviewIssues = async () => {
  try {
    console.log('%c[TOIRAL DEBUG] Starting comprehensive review fix...', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // Get all reviews
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      console.log('%c[TOIRAL WARNING] No reviews found to fix', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
      return { fixed: 0, total: 0 };
    }

    const reviewsData = snapshot.val();
    const reviewsArray = Object.entries(reviewsData);
    let fixedCount = 0;
    let fixedIssuesCount = 0;

    // Check each review and fix all issues
    for (const [reviewId, reviewData] of reviewsArray) {
      const review = reviewData as any; // Use 'any' to handle potentially malformed reviews
      let reviewFixed = false;
      const fixedIssues: string[] = [];
      const updatedFields: Record<string, any> = {};

      console.log('%c[TOIRAL DEBUG] Checking review for issues:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
        reviewId, review.name);

      // 1. Fix missing or non-boolean approval status
      if (review.approved !== true) {
        updatedFields.approved = true;
        fixedIssues.push('approval status');
      }

      // 2. Fix missing or empty review text
      if (!review.review || review.review.trim() === '') {
        const defaultRating = typeof review.rating === 'number' ? review.rating : 5;
        const defaultReviewText = `${review.name || 'Customer'} had a great experience and gave us ${defaultRating} stars.`;
        updatedFields.review = defaultReviewText;
        fixedIssues.push('missing review text');
      }

      // 3. Fix missing or invalid rating
      if (typeof review.rating !== 'number') {
        updatedFields.rating = 5; // Default to 5 stars
        fixedIssues.push('invalid rating');
      }

      // 4. Fix missing name
      if (!review.name) {
        updatedFields.name = `Customer ${reviewId.slice(-4)}`; // Use last 4 chars of ID
        fixedIssues.push('missing name');
      }

      // 5. Fix missing date
      if (!review.date) {
        updatedFields.date = new Date().toISOString();
        fixedIssues.push('missing date');
      }

      // 6. Fix missing ID (should never happen, but just in case)
      if (!review.id) {
        updatedFields.id = reviewId;
        fixedIssues.push('missing ID');
      }

      // Apply fixes if needed
      if (Object.keys(updatedFields).length > 0) {
        const reviewRef = ref(database, `reviews/${reviewId}`);
        await update(reviewRef, updatedFields);

        console.log('%c[TOIRAL SUCCESS] Fixed review issues:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
          reviewId, review.name, 'fixed issues:', fixedIssues.join(', '), 'updated fields:', updatedFields);

        reviewFixed = true;
        fixedCount++;
        fixedIssuesCount += fixedIssues.length;
      } else {
        console.log('%c[TOIRAL DEBUG] No issues found in review:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
          reviewId, review.name);
      }
    }

    console.log('%c[TOIRAL SUCCESS] Comprehensive review fix complete:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;',
      `Fixed ${fixedCount} reviews with ${fixedIssuesCount} total issues out of ${reviewsArray.length} reviews`);

    return { fixed: fixedCount, totalIssues: fixedIssuesCount, total: reviewsArray.length };
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error during comprehensive review fix:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

// Function to get all reviews without any filtering (for debugging)
export const getAllReviewsRaw = async () => {
  try {
    console.log('%c[TOIRAL DEBUG] Getting all reviews without filtering...', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // Get all reviews
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      console.log('%c[TOIRAL WARNING] No reviews found', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
      return [];
    }

    const reviewsData = snapshot.val();
    const reviewsArray = Object.values(reviewsData);

    console.log('%c[TOIRAL DEBUG] Raw reviews retrieved:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
      reviewsArray.length, 'reviews');

    return reviewsArray;
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error getting raw reviews:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

export const updateReviewApproval = async (reviewId: string, approved: boolean) => {
  try {
    console.log(`%c[TOIRAL DEBUG] Updating review approval for ID ${reviewId} to ${approved}`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // First check if the review exists
    const reviewRef = ref(database, `reviews/${reviewId}`);
    const snapshot = await get(reviewRef);

    if (!snapshot.exists()) {
      console.error(`%c[TOIRAL ERROR] Review with ID ${reviewId} does not exist`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;');
      throw new Error(`Review with ID ${reviewId} does not exist`);
    }

    const currentReview = snapshot.val();
    console.log(`%c[TOIRAL DEBUG] Current review data:`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;', {
      id: currentReview.id,
      name: currentReview.name,
      approved: currentReview.approved,
      featured: currentReview.featured
    });

    // Validate the review object
    if (!currentReview || typeof currentReview !== 'object') {
      console.error(`%c[TOIRAL ERROR] Invalid review data for ID ${reviewId}`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;');
      throw new Error(`Invalid review data for ID ${reviewId}`);
    }

    // Ensure the review has all required fields
    if (!currentReview.id || !currentReview.name || !currentReview.review || !currentReview.rating) {
      console.error(`%c[TOIRAL ERROR] Review is missing required fields`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', currentReview);
      throw new Error(`Review is missing required fields`);
    }

    // Check if the review is already in the desired state
    if (currentReview.approved === approved) {
      console.log(`%c[TOIRAL INFO] Review approval is already set to ${approved}, no update needed`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');
      return { success: true, changed: false, message: 'Review already in desired state' };
    }

    // Try multiple approaches to update the review
    let updateSuccess = false;
    let updateMethod = '';

    // Approach 1: Use update method (preferred for atomic updates)
    try {
      // Ensure we're using a boolean value for approved
      const approvedBoolean = Boolean(approved);
      console.log(`%c[TOIRAL DEBUG] Setting approval status to boolean value:`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;', approvedBoolean);

      await update(reviewRef, { approved: approvedBoolean });
      console.log(`%c[TOIRAL SUCCESS] Successfully updated review approval using update method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
      updateSuccess = true;
      updateMethod = 'update';
    } catch (updateError) {
      console.error(`%c[TOIRAL ERROR] Failed to update review using update method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', updateError);
    }

    // Approach 2: Use set method with the entire review object if update failed
    if (!updateSuccess) {
      try {
        // Ensure we're using a boolean value for approved
        const approvedBoolean = Boolean(approved);

        await set(reviewRef, {
          ...currentReview,
          approved: approvedBoolean
        });
        console.log(`%c[TOIRAL SUCCESS] Successfully updated review approval using set method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
        updateSuccess = true;
        updateMethod = 'set';
      } catch (setError) {
        console.error(`%c[TOIRAL ERROR] Failed to update review using set method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', setError);
      }
    }

    // Approach 3: Try to update the specific path directly
    if (!updateSuccess) {
      try {
        // Ensure we're using a boolean value for approved
        const approvedBoolean = Boolean(approved);

        const specificRef = ref(database, `reviews/${reviewId}/approved`);
        await set(specificRef, approvedBoolean);
        console.log(`%c[TOIRAL SUCCESS] Successfully updated review approval using specific path method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
        updateSuccess = true;
        updateMethod = 'specific path';
      } catch (specificError) {
        console.error(`%c[TOIRAL ERROR] Failed to update review using specific path method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', specificError);
      }
    }

    // If all approaches failed, throw an error
    if (!updateSuccess) {
      throw new Error(`All attempts to update review approval failed`);
    }

    // Verify the update was successful by reading the review again
    let verificationSuccess = false;
    try {
      const verifySnapshot = await get(reviewRef);
      if (verifySnapshot.exists()) {
        const updatedReview = verifySnapshot.val();
        if (updatedReview.approved === approved) {
          console.log(`%c[TOIRAL SUCCESS] Verified review approval was updated correctly`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
          verificationSuccess = true;
        } else {
          console.warn(`%c[TOIRAL WARNING] Review approval verification failed - expected ${approved} but got ${updatedReview.approved}`, 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
        }
      }
    } catch (verifyError) {
      console.warn(`%c[TOIRAL WARNING] Failed to verify review update:`, 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;', verifyError);
    }

    // Force a database refresh to ensure all listeners get the update
    try {
      const reviewsRef = ref(database, 'reviews');
      const forceRefreshSnapshot = await get(reviewsRef);
      if (forceRefreshSnapshot.exists()) {
        console.log(`%c[TOIRAL DEBUG] Force refreshed reviews data to trigger listeners`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');
      }
    } catch (refreshError) {
      console.warn(`%c[TOIRAL WARNING] Failed to force refresh reviews:`, 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;', refreshError);
    }

    // Dispatch a review_approved event to notify other components
    if (approved) {
      dispatchReviewEvent('review_approved', {
        reviewId,
        approved: true,
        source: 'contentDatabase'
      });
      console.log(`%c[TOIRAL EVENT] Dispatched review_approved event for ID:`, 'background: #9b59b6; color: white; padding: 2px 5px; border-radius: 3px;', reviewId);
    } else {
      dispatchReviewEvent('review_updated', {
        reviewId,
        approved: false,
        source: 'contentDatabase'
      });
      console.log(`%c[TOIRAL EVENT] Dispatched review_updated event for ID:`, 'background: #9b59b6; color: white; padding: 2px 5px; border-radius: 3px;', reviewId);
    }

    return {
      success: updateSuccess,
      verified: verificationSuccess,
      method: updateMethod,
      changed: true,
      reviewId
    };
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error updating review approval:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

export const updateReviewFeatured = async (reviewId: string, featured: boolean) => {
  try {
    console.log(`%c[TOIRAL DEBUG] Updating review featured status for ID ${reviewId} to ${featured}`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // First check if the review exists
    const reviewRef = ref(database, `reviews/${reviewId}`);
    const snapshot = await get(reviewRef);

    if (!snapshot.exists()) {
      console.error(`%c[TOIRAL ERROR] Review with ID ${reviewId} does not exist`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;');
      throw new Error(`Review with ID ${reviewId} does not exist`);
    }

    const currentReview = snapshot.val();

    // Try multiple approaches to update the review
    let updateSuccess = false;

    // Approach 1: Use update method
    try {
      await update(reviewRef, { featured });
      console.log(`%c[TOIRAL SUCCESS] Successfully updated review featured status using update method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
      updateSuccess = true;
    } catch (updateError) {
      console.error(`%c[TOIRAL ERROR] Failed to update review featured status using update method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', updateError);
    }

    // Approach 2: Use set method with the entire review object if update failed
    if (!updateSuccess) {
      try {
        await set(reviewRef, {
          ...currentReview,
          featured
        });
        console.log(`%c[TOIRAL SUCCESS] Successfully updated review featured status using set method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
        updateSuccess = true;
      } catch (setError) {
        console.error(`%c[TOIRAL ERROR] Failed to update review featured status using set method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', setError);
      }
    }

    // Approach 3: Try to update the specific path directly
    if (!updateSuccess) {
      try {
        const specificRef = ref(database, `reviews/${reviewId}/featured`);
        await set(specificRef, featured);
        console.log(`%c[TOIRAL SUCCESS] Successfully updated review featured status using specific path method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
        updateSuccess = true;
      } catch (specificError) {
        console.error(`%c[TOIRAL ERROR] Failed to update review featured status using specific path method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', specificError);
      }
    }

    // If all approaches failed, throw an error
    if (!updateSuccess) {
      throw new Error(`All attempts to update review featured status failed`);
    }

    return true;
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error updating review featured status:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

export const updateReviewPosition = async (reviewId: string, position: number) => {
  try {
    console.log(`%c[TOIRAL DEBUG] Updating review position for ID ${reviewId} to ${position}`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // First check if the review exists
    const reviewRef = ref(database, `reviews/${reviewId}`);
    const snapshot = await get(reviewRef);

    if (!snapshot.exists()) {
      console.error(`%c[TOIRAL ERROR] Review with ID ${reviewId} does not exist`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;');
      throw new Error(`Review with ID ${reviewId} does not exist`);
    }

    const currentReview = snapshot.val();

    // Try multiple approaches to update the review
    let updateSuccess = false;

    // Approach 1: Use update method
    try {
      await update(reviewRef, { position });
      console.log(`%c[TOIRAL SUCCESS] Successfully updated review position using update method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
      updateSuccess = true;
    } catch (updateError) {
      console.error(`%c[TOIRAL ERROR] Failed to update review position using update method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', updateError);
    }

    // Approach 2: Use set method with the entire review object if update failed
    if (!updateSuccess) {
      try {
        await set(reviewRef, {
          ...currentReview,
          position
        });
        console.log(`%c[TOIRAL SUCCESS] Successfully updated review position using set method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
        updateSuccess = true;
      } catch (setError) {
        console.error(`%c[TOIRAL ERROR] Failed to update review position using set method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', setError);
      }
    }

    // Approach 3: Try to update the specific path directly
    if (!updateSuccess) {
      try {
        const specificRef = ref(database, `reviews/${reviewId}/position`);
        await set(specificRef, position);
        console.log(`%c[TOIRAL SUCCESS] Successfully updated review position using specific path method`, 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;');
        updateSuccess = true;
      } catch (specificError) {
        console.error(`%c[TOIRAL ERROR] Failed to update review position using specific path method:`, 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', specificError);
      }
    }

    // If all approaches failed, throw an error
    if (!updateSuccess) {
      throw new Error(`All attempts to update review position failed`);
    }

    return true;
  } catch (error) {
    console.error('%c[TOIRAL ERROR] Error updating review position:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    console.log(`%c[TOIRAL DEBUG] Deleting review with ID ${reviewId}`, 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');

    // Remove the review from Firebase
    await remove(ref(database, `reviews/${reviewId}`));

    // Dispatch a review_deleted event to notify other components
    dispatchReviewEvent('review_deleted', {
      reviewId,
      source: 'contentDatabase'
    });
    console.log(`%c[TOIRAL EVENT] Dispatched review_deleted event for ID:`, 'background: #9b59b6; color: white; padding: 2px 5px; border-radius: 3px;', reviewId);

    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const subscribeToReviews = (callback: (reviews: Review[]) => void) => {
  console.log('%c[TOIRAL DEBUG] Setting up reviews subscription', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;');
  const reviewsRef = ref(database, 'reviews');

  return onValue(reviewsRef, (snapshot) => {
    try {
      if (snapshot.exists()) {
        const reviewsData = snapshot.val();
        console.log('%c[TOIRAL DEBUG] Reviews data received:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;', reviewsData);

        // Validate that reviewsData is an object
        if (typeof reviewsData !== 'object' || reviewsData === null) {
          console.error('%c[TOIRAL ERROR] Reviews data is not an object:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', reviewsData);
          callback([]);
          return;
        }

        // Convert object to array
        const reviewsArray = Object.values(reviewsData) as Review[];

        // Validate each review object
        const validReviews = reviewsArray.filter(review => {
          if (!review || typeof review !== 'object') {
            console.warn('%c[TOIRAL WARNING] Invalid review object:', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;', review);
            return false;
          }

          if (!review.id) {
            console.warn('%c[TOIRAL WARNING] Review missing ID:', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;', review);
            return false;
          }

          return true;
        });

        // Log all reviews with their approval status for debugging
        console.log('%c[TOIRAL DEBUG] All reviews with approval status:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
          validReviews.map(r => ({
            id: r.id,
            name: r.name,
            approved: r.approved,
            approvedType: typeof r.approved
          }))
        );

        // Handle different data types for the approved property
        // Some databases might store boolean as string "true"/"false" or 1/0
        const approvedReviews = validReviews.filter(r =>
          r.approved === true ||
          r.approved === 'true' ||
          r.approved === 1 ||
          r.approved === '1'
        );

        console.log('%c[TOIRAL DEBUG] Approved reviews:', 'background: #3498db; color: white; padding: 2px 5px; border-radius: 3px;',
          approvedReviews.length, 'out of', validReviews.length);

        // Sort reviews by date, featured status, and position
        const sortedReviews = validReviews.sort((a, b) => {
          // First prioritize featured reviews
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;

          // Then sort by position if available
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
          }

          // Then sort by date (newest first)
          try {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } catch (error) {
            return 0;
          }
        });

        console.log('%c[TOIRAL SUCCESS] Reviews processed and sorted:', 'background: #2ecc71; color: white; padding: 2px 5px; border-radius: 3px;', sortedReviews.length);

        // Dispatch an event to notify components that reviews have been updated
        dispatchReviewEvent('reviews_refreshed', {
          source: 'subscribeToReviews'
        });

        callback(sortedReviews);
      } else {
        console.log('%c[TOIRAL WARNING] No reviews found in Firebase', 'background: #f39c12; color: white; padding: 2px 5px; border-radius: 3px;');
        callback([]);
      }
    } catch (error) {
      console.error('%c[TOIRAL ERROR] Error processing reviews data:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
      callback([]);
    }
  }, (error) => {
    console.error('%c[TOIRAL ERROR] Firebase reviews subscription error:', 'background: #e74c3c; color: white; padding: 2px 5px; border-radius: 3px;', error);
    callback([]);
  });
};

// Contact Form Submissions
export const addContactSubmission = async (contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  userPhotoURL?: string;
}) => {
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

    // Create a notification for the new contact submission with enhanced information
    await addNotification({
      type: 'contact',
      title: 'New Contact Message',
      message: `${contactData.name}: ${contactData.subject}${contactData.userId ? ' (Authenticated User)' : ''}`,
      sourceId: contactId,
      userName: contactData.name
    });

    console.log('Contact submission added successfully:', {
      contactId,
      name: contactData.name,
      subject: contactData.subject,
      authenticated: !!contactData.userId
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
