import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { ref, set, get, update, serverTimestamp } from 'firebase/database';
import { database } from '../firebase/config';
import { encryptData } from '../utils/encryption';

// Get the Firebase auth instance
const auth = getAuth();

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Security settings for password validation
 */
const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true
};

/**
 * Validates a password against the security policy
 * @param password The password to validate
 * @returns An object with validation result and error message
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    return { 
      valid: false, 
      message: `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long` 
    };
  }
  
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase letter' 
    };
  }
  
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one lowercase letter' 
    };
  }
  
  if (PASSWORD_POLICY.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one number' 
    };
  }
  
  if (PASSWORD_POLICY.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one special character' 
    };
  }
  
  return { valid: true };
};

/**
 * Records login activity for security monitoring
 * @param userId The user ID
 * @param data Login activity data
 */
const recordLoginActivity = async (userId: string, data: any) => {
  try {
    // Generate a unique ID for this login record
    const timestamp = new Date().getTime();
    const loginId = `${userId}_${timestamp}`;
    
    // Store login activity
    await set(ref(database, `userLogins/${loginId}`), {
      userId,
      timestamp: data.timestamp,
      ipAddress: data.ipAddress || 'unknown',
      userAgent: data.userAgent || 'unknown',
      method: data.method || 'email'
    });
    
    // Update user's last login timestamp
    await update(ref(database, `profile/${userId}`), {
      lastLogin: data.timestamp
    });
    
    // Check for suspicious activity
    const loginCount = await getRecentLoginCount(userId);
    if (loginCount > 5) {
      await recordSuspiciousActivity(userId, 'multiple_logins', 'Multiple login attempts detected');
    }
  } catch (error) {
    console.error('Error recording login activity:', error);
  }
};

/**
 * Gets the count of recent logins for a user
 * @param userId The user ID
 * @returns The count of recent logins in the last hour
 */
const getRecentLoginCount = async (userId: string): Promise<number> => {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // This is a simplified version - in a real app, you would use a query
    // with orderByChild and startAt to filter by timestamp
    const snapshot = await get(ref(database, 'userLogins'));
    
    let count = 0;
    if (snapshot.exists()) {
      const logins = snapshot.val();
      Object.values(logins).forEach((login: any) => {
        if (login.userId === userId) {
          const loginTime = new Date(login.timestamp);
          if (loginTime > oneHourAgo) {
            count++;
          }
        }
      });
    }
    
    return count;
  } catch (error) {
    console.error('Error getting recent login count:', error);
    return 0;
  }
};

/**
 * Records suspicious activity for security monitoring
 * @param userId The user ID
 * @param action The suspicious action
 * @param details Additional details
 */
const recordSuspiciousActivity = async (userId: string, action: string, details: string) => {
  try {
    const timestamp = new Date().getTime();
    await set(ref(database, `securityLogs/suspiciousActivity/${timestamp}`), {
      userId,
      action,
      details,
      ip: await getClientIP(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error recording suspicious activity:', error);
  }
};

/**
 * Gets the client IP address
 * @returns The client IP address or 'unknown'
 */
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting client IP:', error);
    return 'unknown';
  }
};

/**
 * Registers a new user with email and password
 * @param email User email
 * @param password User password
 * @param displayName User display name
 * @returns Object with success status and user or error
 */
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<{ success: boolean; user?: User; error?: any }> => {
  try {
    // Validate password against security policy
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, error: { message: passwordValidation.message } };
    }
    
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await updateProfile(user, { displayName });
    
    // Create user profile in database with default role and permissions
    const timestamp = new Date().toISOString();
    await set(ref(database, `profile/${user.uid}`), {
      displayName,
      email,
      role: 'user',
      permissions: {
        canReadPublicContent: true,
        canSubmitReviews: true,
        canCreateBookings: true,
        canManageOwnProfile: true,
        canParticipateInCommunity: true
      },
      createdAt: timestamp,
      lastLogin: timestamp
    });
    
    // Record login activity
    await recordLoginActivity(user.uid, {
      timestamp,
      method: 'registration',
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error };
  }
};

/**
 * Signs in a user with email and password
 * @param email User email
 * @param password User password
 * @returns Object with success status and user or error
 */
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: any }> => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Record login activity
    await recordLoginActivity(user.uid, {
      timestamp: new Date().toISOString(),
      method: 'email',
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error signing in with email:', error);
    
    // Record failed login attempt
    await set(ref(database, `securityLogs/loginAttempts/${new Date().getTime()}`), {
      email,
      success: false,
      ip: await getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    return { success: false, error };
  }
};

/**
 * Signs in a user with Google
 * @returns Object with success status and user or error
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: any }> => {
  try {
    // Sign in with Google
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    
    // Check if user profile exists
    const userProfileSnapshot = await get(ref(database, `profile/${user.uid}`));
    
    if (!userProfileSnapshot.exists()) {
      // Create user profile if it doesn't exist
      const timestamp = new Date().toISOString();
      await set(ref(database, `profile/${user.uid}`), {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        permissions: {
          canReadPublicContent: true,
          canSubmitReviews: true,
          canCreateBookings: true,
          canManageOwnProfile: true,
          canParticipateInCommunity: true
        },
        createdAt: timestamp,
        lastLogin: timestamp
      });
    } else {
      // Update last login timestamp
      await update(ref(database, `profile/${user.uid}`), {
        lastLogin: new Date().toISOString()
      });
    }
    
    // Record login activity
    await recordLoginActivity(user.uid, {
      timestamp: new Date().toISOString(),
      method: 'google',
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error };
  }
};

/**
 * Signs out the current user
 * @returns Object with success status and error if any
 */
export const signOutUser = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

/**
 * Sends a password reset email to the user
 * @param email User email
 * @returns Object with success status and error if any
 */
export const resetPassword = async (email: string): Promise<{ success: boolean; error?: any }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
};

/**
 * Updates the user's password
 * @param currentPassword Current password for verification
 * @param newPassword New password
 * @returns Object with success status and error if any
 */
export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: { message: 'User not authenticated' } };
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, error: { message: passwordValidation.message } };
    }
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    
    // Record password change for security monitoring
    await recordSuspiciousActivity(user.uid, 'password_change', 'User changed their password');
    
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error };
  }
};

/**
 * Gets the current authenticated user
 * @returns The current user or null
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Gets the user's role and permissions
 * @param userId User ID
 * @returns Object with role and permissions
 */
export const getUserRoleAndPermissions = async (userId: string): Promise<{ role: string; permissions: any }> => {
  try {
    const snapshot = await get(ref(database, `profile/${userId}`));
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return {
        role: userData.role || 'user',
        permissions: userData.permissions || {}
      };
    }
    
    return {
      role: 'user',
      permissions: {}
    };
  } catch (error) {
    console.error('Error getting user role and permissions:', error);
    return {
      role: 'user',
      permissions: {}
    };
  }
};
