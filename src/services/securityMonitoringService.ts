import { ref, set, push, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Records a security event for monitoring
 * @param eventType The type of security event
 * @param data The event data
 */
export const recordSecurityEvent = async (
  eventType: string,
  data: any
): Promise<void> => {
  try {
    const timestamp = Date.now();
    const eventRef = ref(database, `securityLogs/${eventType}/${timestamp}`);
    
    await set(eventRef, {
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error recording ${eventType} event:`, error);
  }
};

/**
 * Records a login attempt (successful or failed)
 * @param email The email used for the login attempt
 * @param success Whether the login was successful
 * @param ipAddress The IP address of the client
 * @param userAgent The user agent of the client
 */
export const recordLoginAttempt = async (
  email: string,
  success: boolean,
  ipAddress: string,
  userAgent: string
): Promise<void> => {
  await recordSecurityEvent('loginAttempts', {
    email,
    success,
    ip: ipAddress,
    userAgent
  });
};

/**
 * Records suspicious activity for security monitoring
 * @param userId The user ID (or 'unknown' if not available)
 * @param action The suspicious action
 * @param details Additional details about the activity
 * @param ipAddress The IP address of the client
 */
export const recordSuspiciousActivity = async (
  userId: string,
  action: string,
  details: string,
  ipAddress: string
): Promise<void> => {
  await recordSecurityEvent('suspiciousActivity', {
    userId,
    action,
    details,
    ip: ipAddress
  });
};

/**
 * Records a permission change for security monitoring
 * @param adminId The ID of the admin making the change
 * @param targetUserId The ID of the user whose permissions are being changed
 * @param changes The permission changes being made
 * @param ipAddress The IP address of the admin
 */
export const recordPermissionChange = async (
  adminId: string,
  targetUserId: string,
  changes: any,
  ipAddress: string
): Promise<void> => {
  await recordSecurityEvent('permissionChanges', {
    adminId,
    targetUserId,
    changes,
    ip: ipAddress
  });
};

/**
 * Records a role change for security monitoring
 * @param adminId The ID of the admin making the change
 * @param targetUserId The ID of the user whose role is being changed
 * @param oldRole The previous role
 * @param newRole The new role
 * @param ipAddress The IP address of the admin
 */
export const recordRoleChange = async (
  adminId: string,
  targetUserId: string,
  oldRole: string,
  newRole: string,
  ipAddress: string
): Promise<void> => {
  await recordSecurityEvent('roleChanges', {
    adminId,
    targetUserId,
    oldRole,
    newRole,
    ip: ipAddress
  });
};

/**
 * Detects potential brute force attacks by checking for multiple failed login attempts
 * @param email The email to check
 * @param threshold The number of failed attempts that triggers detection
 * @param timeWindowMs The time window in milliseconds
 * @returns Whether a potential brute force attack was detected
 */
export const detectBruteForceAttack = async (
  email: string,
  threshold: number = 5,
  timeWindowMs: number = 300000 // 5 minutes
): Promise<boolean> => {
  try {
    // Get recent login attempts
    const loginAttemptsRef = query(
      ref(database, 'securityLogs/loginAttempts'),
      orderByChild('timestamp'),
      limitToLast(20) // Limit to last 20 attempts for efficiency
    );
    
    const snapshot = await get(loginAttemptsRef);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    // Filter login attempts by email and time window
    const now = Date.now();
    const timeThreshold = new Date(now - timeWindowMs).toISOString();
    
    let failedAttempts = 0;
    
    snapshot.forEach((childSnapshot) => {
      const attempt = childSnapshot.val();
      
      if (
        attempt.email === email &&
        !attempt.success &&
        attempt.timestamp >= timeThreshold
      ) {
        failedAttempts++;
      }
    });
    
    // Check if failed attempts exceed threshold
    if (failedAttempts >= threshold) {
      // Record the detection
      await recordSecurityEvent('threatDetections', {
        type: 'bruteForce',
        email,
        failedAttempts,
        detectedAt: new Date().toISOString()
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting brute force attack:', error);
    return false;
  }
};

/**
 * Detects suspicious login patterns (e.g., logins from different locations)
 * @param userId The user ID to check
 * @returns Whether suspicious login patterns were detected
 */
export const detectSuspiciousLoginPatterns = async (
  userId: string
): Promise<boolean> => {
  try {
    // Get recent login attempts for the user
    const userLoginsRef = query(
      ref(database, 'userLogins'),
      orderByChild('userId'),
      limitToLast(10) // Limit to last 10 logins for efficiency
    );
    
    const snapshot = await get(userLoginsRef);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    // Extract IP addresses from recent logins
    const ipAddresses = new Set<string>();
    const recentLogins: any[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const login = childSnapshot.val();
      
      if (login.userId === userId) {
        ipAddresses.add(login.ipAddress);
        recentLogins.push(login);
      }
    });
    
    // Check if user has logged in from multiple IP addresses in a short time
    if (ipAddresses.size > 2 && recentLogins.length >= 3) {
      // Check time between logins
      recentLogins.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Check if there are logins from different IPs within a short time window
      for (let i = 0; i < recentLogins.length - 1; i++) {
        const timeDiff = new Date(recentLogins[i].timestamp).getTime() - 
                         new Date(recentLogins[i + 1].timestamp).getTime();
        
        if (
          timeDiff < 3600000 && // 1 hour
          recentLogins[i].ipAddress !== recentLogins[i + 1].ipAddress
        ) {
          // Record the detection
          await recordSecurityEvent('threatDetections', {
            type: 'suspiciousLoginPattern',
            userId,
            ipAddresses: Array.from(ipAddresses),
            detectedAt: new Date().toISOString()
          });
          
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting suspicious login patterns:', error);
    return false;
  }
};
