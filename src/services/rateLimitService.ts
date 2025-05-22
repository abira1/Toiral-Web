import { ref, get, set, increment, serverTimestamp } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

// Rate limit configurations
const RATE_LIMITS = {
  // Default rate limits for different operations
  default: {
    maxRequests: 100,  // Maximum requests
    windowMs: 60000,   // Time window in milliseconds (1 minute)
    message: 'Too many requests, please try again later.'
  },
  // Rate limits for specific operations
  operations: {
    createBooking: {
      maxRequests: 5,
      windowMs: 3600000, // 1 hour
      message: 'You can only create 5 bookings per hour.'
    },
    submitReview: {
      maxRequests: 10,
      windowMs: 86400000, // 24 hours
      message: 'You can only submit 10 reviews per day.'
    },
    contactSubmission: {
      maxRequests: 3,
      windowMs: 3600000, // 1 hour
      message: 'You can only submit 3 contact forms per hour.'
    },
    passwordReset: {
      maxRequests: 3,
      windowMs: 3600000, // 1 hour
      message: 'Too many password reset attempts. Please try again later.'
    },
    login: {
      maxRequests: 5,
      windowMs: 300000, // 5 minutes
      message: 'Too many login attempts. Please try again later.'
    }
  }
};

/**
 * Checks if a user has exceeded their rate limit for a specific operation
 * @param userId The user ID
 * @param operation The operation being performed
 * @returns An object with the result and error message if rate limited
 */
export const checkRateLimit = async (
  userId: string, 
  operation: string
): Promise<{ limited: boolean; message?: string }> => {
  try {
    // Get rate limit configuration for the operation
    const config = RATE_LIMITS.operations[operation as keyof typeof RATE_LIMITS.operations] || RATE_LIMITS.default;
    
    // Get current timestamp
    const now = Date.now();
    
    // Get user's rate limit data
    const rateLimitRef = ref(database, `rateLimits/${userId}/${operation}`);
    const snapshot = await get(rateLimitRef);
    
    if (snapshot.exists()) {
      const rateLimitData = snapshot.val();
      const timestamp = rateLimitData.timestamp || 0;
      const count = rateLimitData.count || 0;
      
      // Check if the time window has expired
      if (now - timestamp > config.windowMs) {
        // Reset rate limit if time window has expired
        await set(rateLimitRef, {
          count: 1,
          timestamp: now
        });
        
        return { limited: false };
      }
      
      // Check if user has exceeded the rate limit
      if (count >= config.maxRequests) {
        return { 
          limited: true, 
          message: config.message 
        };
      }
      
      // Increment the request count
      await set(rateLimitRef, {
        count: count + 1,
        timestamp: timestamp
      });
      
      return { limited: false };
    } else {
      // Initialize rate limit data for new users
      await set(rateLimitRef, {
        count: 1,
        timestamp: now
      });
      
      return { limited: false };
    }
  } catch (error) {
    console.error('Error checking rate limit:', error);
    
    // In case of error, allow the operation to proceed
    return { limited: false };
  }
};

/**
 * Records a rate-limited operation for security monitoring
 * @param userId The user ID
 * @param operation The operation being performed
 * @param ipAddress The user's IP address
 */
export const recordRateLimitViolation = async (
  userId: string, 
  operation: string, 
  ipAddress: string
): Promise<void> => {
  try {
    const timestamp = Date.now();
    
    await set(ref(database, `securityLogs/rateLimitViolations/${timestamp}`), {
      userId,
      operation,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recording rate limit violation:', error);
  }
};

/**
 * Hook for rate limiting operations in components
 * @param operation The operation to rate limit
 * @returns A function to check if the operation is rate limited
 */
export const useRateLimit = (operation: string) => {
  const { user } = useAuth();
  
  /**
   * Checks if the current user is rate limited for the specified operation
   * @returns A promise that resolves to an object with the result and error message
   */
  const isRateLimited = async (): Promise<{ limited: boolean; message?: string }> => {
    if (!user) {
      return { limited: false };
    }
    
    try {
      // Get client IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ipAddress = ipData.ip;
      
      // Check rate limit
      const result = await checkRateLimit(user.uid, operation);
      
      // Record violation if rate limited
      if (result.limited) {
        await recordRateLimitViolation(user.uid, operation, ipAddress);
      }
      
      return result;
    } catch (error) {
      console.error('Error in rate limit hook:', error);
      return { limited: false };
    }
  };
  
  return { isRateLimited };
};
