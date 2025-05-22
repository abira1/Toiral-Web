import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Win95Button } from './Win95Button';
import { GoogleIcon } from './GoogleIcon';

interface UserLoginProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserLogin({ onClose, onSuccess }: UserLoginProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();

      if (result.user) {
        if (onSuccess) onSuccess();
        onClose();
      } else if (result.error) {
        setError(result.error.message);
        console.error("Google sign-in error:", result.error);
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred during sign in. Please try again.");
      console.error("Google sign in unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4 max-w-md mx-auto">
      {/* Removed the duplicate title header */}

      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="font-mono text-lg mb-2">Welcome to Toiral</h2>
          <p className="font-mono text-sm text-gray-700 mb-4">
            Sign in to book appointments and manage your account
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4">
            <p className="font-mono text-sm text-red-700">{error}</p>
          </div>
        )}

        <Win95Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 flex items-center justify-center gap-3"
        >
          <GoogleIcon className="w-5 h-5" />
          <span className="font-mono">
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </span>
        </Win95Button>

        <div className="text-center mt-4">
          <p className="font-mono text-xs text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
