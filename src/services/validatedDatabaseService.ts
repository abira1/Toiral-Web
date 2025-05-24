/**
 * Validated Database Service
 * 
 * This service wraps existing Firebase database operations with validation.
 * It provides a non-breaking layer that validates data before operations
 * while maintaining full backward compatibility.
 * 
 * IMPORTANT: This service is designed to be gradually integrated.
 * All existing database operations will continue to work unchanged.
 */

import { 
  validateBeforeOperation,
  ValidationOptions,
  validatePortfolioItem,
  validateReview,
  validateBookingSubmission,
  validateContactFormSubmission,
  validateUserProfile
} from './databaseValidationService';

import {
  addBooking as originalAddBooking,
  addReview as originalAddReview,
  addContactSubmission as originalAddContactSubmission,
  updateReview as originalUpdateReview,
  deleteReview as originalDeleteReview
} from '../firebase/contentDatabase';

// Default validation options for production use
const defaultValidationOptions: ValidationOptions = {
  strict: false, // Non-breaking: allow operations even with validation errors
  sanitize: true, // Clean and normalize data
  allowExtraFields: true, // Backward compatibility: allow extra fields
  skipValidation: false // Enable validation by default
};

/**
 * Enhanced booking creation with validation
 */
export const addValidatedBooking = async (
  bookingData: any,
  options: Partial<ValidationOptions> = {}
): Promise<string> => {
  const opts = { ...defaultValidationOptions, ...options };
  
  try {
    // Validate the booking data
    const validation = await validateBeforeOperation(
      bookingData,
      'bookingSubmission',
      'create',
      opts
    );

    // Log validation results for monitoring
    if (!validation.success && opts.strict) {
      console.error('Booking validation failed:', validation.errors);
      throw new Error(`Booking validation failed: ${JSON.stringify(validation.errors)}`);
    }

    if (validation.errors && Object.keys(validation.errors).length > 0) {
      console.warn('Booking validation warnings:', validation.errors);
    }

    // Use sanitized data if available, otherwise use original data
    const dataToSave = validation.validatedData || bookingData;
    
    // Call the original booking function
    return await originalAddBooking(dataToSave);
  } catch (error) {
    console.error('Error in validated booking creation:', error);
    
    // In case of validation system error, fall back to original function
    if (!opts.strict) {
      console.warn('Falling back to original booking creation due to validation error');
      return await originalAddBooking(bookingData);
    }
    
    throw error;
  }
};

/**
 * Enhanced review creation with validation
 */
export const addValidatedReview = async (
  reviewData: any,
  options: Partial<ValidationOptions> = {}
): Promise<string> => {
  const opts = { ...defaultValidationOptions, ...options };
  
  try {
    const validation = await validateBeforeOperation(
      reviewData,
      'review',
      'create',
      opts
    );

    if (!validation.success && opts.strict) {
      console.error('Review validation failed:', validation.errors);
      throw new Error(`Review validation failed: ${JSON.stringify(validation.errors)}`);
    }

    if (validation.errors && Object.keys(validation.errors).length > 0) {
      console.warn('Review validation warnings:', validation.errors);
    }

    const dataToSave = validation.validatedData || reviewData;
    return await originalAddReview(dataToSave);
  } catch (error) {
    console.error('Error in validated review creation:', error);
    
    if (!opts.strict) {
      console.warn('Falling back to original review creation due to validation error');
      return await originalAddReview(reviewData);
    }
    
    throw error;
  }
};

/**
 * Enhanced contact submission with validation
 */
export const addValidatedContactSubmission = async (
  contactData: any,
  options: Partial<ValidationOptions> = {}
): Promise<string> => {
  const opts = { ...defaultValidationOptions, ...options };
  
  try {
    const validation = await validateBeforeOperation(
      contactData,
      'contactFormSubmission',
      'create',
      opts
    );

    if (!validation.success && opts.strict) {
      console.error('Contact submission validation failed:', validation.errors);
      throw new Error(`Contact validation failed: ${JSON.stringify(validation.errors)}`);
    }

    if (validation.errors && Object.keys(validation.errors).length > 0) {
      console.warn('Contact submission validation warnings:', validation.errors);
    }

    const dataToSave = validation.validatedData || contactData;
    return await originalAddContactSubmission(dataToSave);
  } catch (error) {
    console.error('Error in validated contact submission:', error);
    
    if (!opts.strict) {
      console.warn('Falling back to original contact submission due to validation error');
      return await originalAddContactSubmission(contactData);
    }
    
    throw error;
  }
};

/**
 * Enhanced review update with validation
 */
export const updateValidatedReview = async (
  reviewId: string,
  reviewData: any,
  options: Partial<ValidationOptions> = {}
): Promise<void> => {
  const opts = { ...defaultValidationOptions, ...options };
  
  try {
    const validation = await validateBeforeOperation(
      reviewData,
      'review',
      'update',
      opts
    );

    if (!validation.success && opts.strict) {
      console.error('Review update validation failed:', validation.errors);
      throw new Error(`Review update validation failed: ${JSON.stringify(validation.errors)}`);
    }

    if (validation.errors && Object.keys(validation.errors).length > 0) {
      console.warn('Review update validation warnings:', validation.errors);
    }

    const dataToSave = validation.validatedData || reviewData;
    return await originalUpdateReview(reviewId, dataToSave);
  } catch (error) {
    console.error('Error in validated review update:', error);
    
    if (!opts.strict) {
      console.warn('Falling back to original review update due to validation error');
      return await originalUpdateReview(reviewId, reviewData);
    }
    
    throw error;
  }
};

/**
 * Validation-aware review deletion
 */
export const deleteValidatedReview = async (
  reviewId: string,
  options: Partial<ValidationOptions> = {}
): Promise<void> => {
  const opts = { ...defaultValidationOptions, ...options };
  
  try {
    // For delete operations, we mainly log for audit purposes
    console.log(`Deleting review ${reviewId} with validation logging enabled`);
    
    return await originalDeleteReview(reviewId);
  } catch (error) {
    console.error('Error in validated review deletion:', error);
    throw error;
  }
};

/**
 * Utility function to validate data without performing database operations
 * Useful for form validation in real-time
 */
export const validateDataOnly = async (
  data: any,
  dataType: string,
  options: Partial<ValidationOptions> = {}
) => {
  const opts = { ...defaultValidationOptions, ...options };
  
  return await validateBeforeOperation(data, dataType, 'create', opts);
};

/**
 * Batch validation for multiple items
 */
export const validateBatch = async (
  items: Array<{ data: any; dataType: string }>,
  options: Partial<ValidationOptions> = {}
): Promise<Array<{ success: boolean; validatedData?: any; errors?: any; index: number }>> => {
  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const result = await validateBeforeOperation(
        item.data,
        item.dataType,
        'create',
        options
      );
      results.push({ ...result, index: i });
    } catch (error) {
      console.error(`Error validating item ${i}:`, error);
      results.push({
        success: false,
        errors: { system: 'Validation system error' },
        index: i
      });
    }
  }
  
  return results;
};

/**
 * Get validation statistics for monitoring
 */
export const getValidationStats = () => {
  // This could be enhanced to track validation metrics
  return {
    validationEnabled: true,
    strictMode: defaultValidationOptions.strict,
    sanitizationEnabled: defaultValidationOptions.sanitize,
    allowExtraFields: defaultValidationOptions.allowExtraFields
  };
};

// Export original functions for backward compatibility
export {
  originalAddBooking as addBooking,
  originalAddReview as addReview,
  originalAddContactSubmission as addContactSubmission,
  originalUpdateReview as updateReview,
  originalDeleteReview as deleteReview
};
