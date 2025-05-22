import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

/**
 * Utility function to check if Firebase Authentication is properly configured
 * This will attempt to initialize the Google Auth provider and check for any configuration issues
 */
export async function checkFirebaseAuth(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Check if auth is initialized
    if (!auth) {
      return {
        success: false,
        message: 'Firebase Auth is not initialized',
      };
    }

    // Check if we can create a Google provider (this doesn't make a network request)
    const provider = new GoogleAuthProvider();
    
    // Log the current configuration for debugging
    console.log('Firebase Auth Configuration:', {
      currentUser: auth.currentUser,
      authDomain: auth.app.options.authDomain,
      apiKey: auth.app.options.apiKey,
    });

    return {
      success: true,
      message: 'Firebase Auth is properly initialized',
      details: {
        authDomain: auth.app.options.authDomain,
        providerId: provider.providerId,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Firebase Auth check failed: ${error.message}`,
      details: error
    };
  }
}

/**
 * Test Google sign-in with a popup
 * This will actually attempt to open the Google sign-in popup
 */
export async function testGoogleSignIn(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const provider = new GoogleAuthProvider();
    
    // Add scopes for additional permissions
    provider.addScope('profile');
    provider.addScope('email');
    
    // Set custom parameters
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Try to sign in
    const result = await signInWithPopup(auth, provider);
    
    return {
      success: true,
      message: 'Google sign-in successful',
      details: {
        user: {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        },
        credential: GoogleAuthProvider.credentialFromResult(result),
      }
    };
  } catch (error: any) {
    // Extract error details
    const errorCode = error.code;
    const errorMessage = error.message;
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    return {
      success: false,
      message: `Google sign-in failed: ${errorMessage}`,
      details: {
        errorCode,
        errorMessage,
        email,
        credential,
      }
    };
  }
}
