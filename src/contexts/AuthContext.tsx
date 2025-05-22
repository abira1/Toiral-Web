import React, { useEffect, useState, createContext, useContext } from 'react';
import CryptoJS from 'crypto-js';
import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  onAuthStateChanged,
  updateProfile,
  browserLocalPersistence,
  setPersistence,
  AuthError,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, get, set, push, serverTimestamp, update } from 'firebase/database';
import { database } from '../firebase/config';
import { UserLoginData, UserLoginRecord } from '../models/UserLoginData';
import { recordUserLogin as recordLogin } from '../services/userManagementService';
import { encryptData, decryptData } from '../utils/encryption';

interface UserProfile {
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  uid: string;
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
  role?: 'user' | 'moderator' | 'admin'; // User role for access control
  permissions?: {
    [key: string]: boolean;
  };
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isAdminUser: boolean; // Property to check if user is an admin based on email
  isModeratorUser: boolean; // Property to check if user is a moderator
  user: User | null;
  userProfile: UserProfile | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  signInWithGoogle: () => Promise<{ user: User | null; error?: { code: string; message: string } }>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (displayName: string, phoneNumber: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: any }>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  resetUserPassword: (email: string) => Promise<{ success: boolean; error?: any }>;
  hasPermission: (permission: string) => boolean;
  failedAttempts: number;
  isLocked: boolean;
  remainingLockTime: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true,
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
  noConsecutiveChars: true,
  noCommonPatterns: true
};
export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });

  // Firebase Auth state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isModeratorUser, setIsModeratorUser] = useState(false);

  // Admin email from environment variables
  const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || "abirsabirhossain@gmail.com";

  // Admin login security
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return parseInt(localStorage.getItem('failedLoginAttempts') || '0');
  });
  const [lockoutTimestamp, setLockoutTimestamp] = useState(() => {
    return parseInt(localStorage.getItem('loginLockoutTimestamp') || '0');
  });
  const storedPasswordHash = localStorage.getItem('adminPasswordHash') || CryptoJS.SHA256('admin123').toString();

  // Function to record user login
  const recordUserLogin = async (user: User) => {
    try {
      // Use the userManagementService to record the login
      await recordLogin(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber
      });
    } catch (error) {
      console.error("Error recording user login:", error);
    }
  };

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const previousUser = user;
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);

      // Reset roles
      setIsAdminUser(false);
      setIsModeratorUser(false);

      if (currentUser && currentUser.email) {
        // Check if user is an admin based on email
        const isAdmin = currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        setIsAdminUser(isAdmin);

        // If user is admin by email, also set admin authentication
        if (isAdmin) {
          setIsAdminAuthenticated(true);
          localStorage.setItem('isAdminAuthenticated', 'true');
        }

        // We'll check for moderator status when we fetch the user profile
      }

      if (currentUser) {
        // Record login if this is a new login (not just a page refresh)
        if (!previousUser || previousUser.uid !== currentUser.uid) {
          await recordUserLogin(currentUser);
        }

        // Get user profile from database or create if it doesn't exist
        try {
          console.log("Fetching user profile for:", currentUser.uid);
          const userProfileRef = ref(database, `profile/${currentUser.uid}`);
          const snapshot = await get(userProfileRef);

          if (snapshot.exists()) {
            // Use existing profile
            const profileData = snapshot.val();
            console.log("Found existing profile:", profileData);

            // Ensure all required fields are present
            const updatedProfile: UserProfile = {
              displayName: profileData.displayName || currentUser.displayName,
              email: profileData.email || currentUser.email,
              phoneNumber: profileData.phoneNumber || currentUser.phoneNumber || '',
              photoURL: profileData.photoURL || currentUser.photoURL,
              uid: currentUser.uid,
              role: profileData.role || 'user'
            };

            // Check if user is a moderator
            if (updatedProfile.role === 'moderator') {
              setIsModeratorUser(true);
              console.log("User is a moderator");
            } else if (updatedProfile.role === 'admin') {
              setIsAdminUser(true);
              setIsAdminAuthenticated(true);
              localStorage.setItem('isAdminAuthenticated', 'true');
              console.log("User is an admin by role");
            }

            // Update profile if needed
            if (profileData.displayName !== currentUser.displayName ||
                profileData.email !== currentUser.email ||
                profileData.photoURL !== currentUser.photoURL) {
              console.log("Updating profile with latest user data");
              await set(userProfileRef, updatedProfile);
            }

            setUserProfile(updatedProfile);
          } else {
            console.log("No profile found, creating new profile");
            // Create new profile
            const newProfile: UserProfile = {
              displayName: currentUser.displayName,
              email: currentUser.email,
              phoneNumber: currentUser.phoneNumber || '',
              photoURL: currentUser.photoURL,
              uid: currentUser.uid,
              role: 'user' // Default role for new users
            };

            await set(userProfileRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);

          // Set a basic profile even if there's an error
          const fallbackProfile: UserProfile = {
            displayName: currentUser.displayName,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber || '',
            photoURL: currentUser.photoURL,
            uid: currentUser.uid,
            role: 'user' // Default role for fallback profile
          };
          setUserProfile(fallbackProfile);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, [user]);
  /**
   * Validates a password against security requirements
   * @param password The password to validate
   * @returns An object with validation result and error message
   */
  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    const minLength = PASSWORD_REQUIREMENTS.minLength;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const noConsecutiveChars = !/(.)\1{2,}/.test(password); // No more than 2 consecutive same characters
    const noCommonPatterns = !/^(password|admin|123|qwerty)/i.test(password);

    if (password.length < minLength) {
      return { valid: false, message: `Password must be at least ${minLength} characters long` };
    }

    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number' };
    }

    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }

    if (!hasUppercase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!hasLowercase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!noConsecutiveChars) {
      return { valid: false, message: 'Password must not contain more than 2 consecutive identical characters' };
    }

    if (!noCommonPatterns) {
      return { valid: false, message: 'Password must not contain common patterns like "password", "admin", "123", or "qwerty"' };
    }

    return { valid: true };
  };
  const isLocked = () => {
    if (failedAttempts >= PASSWORD_REQUIREMENTS.maxFailedAttempts) {
      const remainingLockTime = lockoutTimestamp + PASSWORD_REQUIREMENTS.lockoutDuration - Date.now();
      if (remainingLockTime > 0) {
        return true;
      } else {
        setFailedAttempts(0);
        setLockoutTimestamp(0);
        localStorage.setItem('failedLoginAttempts', '0');
        localStorage.removeItem('loginLockoutTimestamp');
      }
    }
    return false;
  };
  const getRemainingLockTime = () => {
    if (!isLocked()) return 0;
    return Math.max(0, lockoutTimestamp + PASSWORD_REQUIREMENTS.lockoutDuration - Date.now());
  };
  // Admin login for admin panel
  const login = (username: string, password: string) => {
    if (isLocked()) return false;
    const passwordHash = CryptoJS.SHA256(password).toString();
    if (username === 'admin' && passwordHash === storedPasswordHash) {
      setIsAdminAuthenticated(true);
      setFailedAttempts(0);
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('failedLoginAttempts', '0');
      return true;
    }
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    localStorage.setItem('failedLoginAttempts', newFailedAttempts.toString());
    if (newFailedAttempts >= PASSWORD_REQUIREMENTS.maxFailedAttempts) {
      const timestamp = Date.now();
      setLockoutTimestamp(timestamp);
      localStorage.setItem('loginLockoutTimestamp', timestamp.toString());
    }
    return false;
  };

  // Google sign-in for users
  const signInWithGoogle = async (): Promise<{ user: User | null; error?: { code: string; message: string } }> => {
    try {
      // First, set persistence to local to keep the user logged in
      await setPersistence(auth, browserLocalPersistence);

      // Create Google provider
      const provider = new GoogleAuthProvider();

      // Add scopes for additional permissions
      provider.addScope('profile');
      provider.addScope('email');

      // Set custom parameters
      provider.setCustomParameters({
        // Force account selection even if user is already signed in
        prompt: 'select_account',
        // Specify the client ID of the app that accesses the backend
        // client_id: firebaseConfig.clientId,
      });

      console.log("Starting Google sign-in process...");
      const result = await signInWithPopup(auth, provider);

      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      console.log("Google sign-in successful:", {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        },
        token: token ? "Token received" : "No token received"
      });

      // Record the login
      await recordUserLogin(result.user);

      return { user: result.user };
    } catch (error: any) {
      // Handle errors
      const errorCode = error.code || "unknown";
      const errorMessage = error.message || "Unknown error occurred";

      // Log detailed error information
      console.error("Error signing in with Google:", {
        code: errorCode,
        message: errorMessage,
        email: error.customData?.email,
        credential: error.credential ? "Credential exists" : "No credential"
      });

      // Provide user-friendly error messages
      let userMessage = "Failed to sign in with Google. Please try again.";

      if (errorCode === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
        userMessage = "Sign-in popup was closed. Please try again.";
      } else if (errorCode === AuthErrorCodes.POPUP_BLOCKED) {
        userMessage = "Sign-in popup was blocked by your browser. Please allow popups for this site.";
      } else if (errorCode === AuthErrorCodes.NETWORK_REQUEST_FAILED) {
        userMessage = "Network error. Please check your internet connection and try again.";
      } else if (errorCode === "auth/unauthorized-domain") {
        userMessage = "This domain is not authorized for Firebase Authentication. Please contact the administrator.";
      }

      return {
        user: null,
        error: {
          code: errorCode,
          message: userMessage
        }
      };
    }
  };

  // Sign out user from Firebase Auth
  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string, phoneNumber: string): Promise<void> => {
    if (!user) throw new Error("No user is signed in");

    try {
      console.log("Updating profile for user:", user.uid);

      // Update Firebase Auth profile
      await updateProfile(user, { displayName });
      console.log("Firebase Auth profile updated");

      // Create a complete profile object
      const updatedProfile: UserProfile = {
        displayName,
        email: user.email,
        phoneNumber,
        photoURL: user.photoURL,
        uid: user.uid
      };

      // Update profile in database
      console.log("Updating profile in database:", updatedProfile);
      await set(ref(database, `profile/${user.uid}`), updatedProfile);

      // Update local state
      setUserProfile(updatedProfile);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Admin password change (for admin panel)
  const changeAdminPassword = (currentPassword: string, newPassword: string) => {
    const currentHash = CryptoJS.SHA256(currentPassword).toString();
    if (currentHash !== storedPasswordHash) return false;
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) return false;
    const newHash = CryptoJS.SHA256(newPassword).toString();
    localStorage.setItem('adminPasswordHash', newHash);
    return true;
  };

  // Firebase user password change
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: any }> => {
    try {
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

  // Record suspicious activity for security monitoring
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

  // Get client IP address
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

  // Admin logout
  const logout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAdminAuthenticated');
  };
  // Register with email and password
  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      // Validate password against security policy
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return { success: false, error: { message: passwordValidation.message } };
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update user profile with display name
      await updateProfile(newUser, { displayName });

      // Create user profile in database with default role and permissions
      const timestamp = new Date().toISOString();
      await set(ref(database, `profile/${newUser.uid}`), {
        displayName,
        email,
        phoneNumber: null,
        photoURL: null,
        uid: newUser.uid,
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
      await recordUserLogin(newUser);

      return { success: true };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error };
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      // Check if account is locked
      if (isLocked()) {
        return {
          success: false,
          error: {
            message: `Account is locked due to too many failed attempts. Try again in ${Math.ceil(getRemainingLockTime() / 60000)} minutes.`
          }
        };
      }

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Reset failed attempts on successful login
      setFailedAttempts(0);
      localStorage.setItem('failedLoginAttempts', '0');

      return { success: true };
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

      // Increment failed attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem('failedLoginAttempts', newFailedAttempts.toString());

      // Lock account if too many failed attempts
      if (newFailedAttempts >= PASSWORD_REQUIREMENTS.maxFailedAttempts) {
        const timestamp = Date.now();
        setLockoutTimestamp(timestamp);
        localStorage.setItem('loginLockoutTimestamp', timestamp.toString());

        // Record suspicious activity
        await recordSuspiciousActivity('unknown', 'account_locked', `Account locked after ${newFailedAttempts} failed attempts for email: ${email}`);
      }

      return { success: false, error };
    }
  };

  // Reset user password
  const resetUserPassword = async (email: string): Promise<{ success: boolean; error?: any }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!userProfile || !userProfile.permissions) {
      return false;
    }

    return !!userProfile.permissions[permission];
  };

  return <AuthContext.Provider value={{
    isAuthenticated,
    isAdminAuthenticated,
    isAdminUser,
    isModeratorUser,
    user,
    userProfile,
    login,
    logout,
    signInWithGoogle,
    signOutUser,
    updateUserProfile,
    changePassword,
    registerWithEmail,
    signInWithEmail,
    resetUserPassword,
    hasPermission,
    failedAttempts,
    isLocked: isLocked(),
    remainingLockTime: getRemainingLockTime()
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};