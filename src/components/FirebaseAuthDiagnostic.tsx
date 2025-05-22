import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { checkFirebaseAuth, testGoogleSignIn } from '../utils/checkFirebaseAuth';
import {
  checkFirebaseAuthDomain,
  checkFirebaseSDKVersion,
  getCacheClearingInstructions
} from '../utils/fixFirebaseConfig';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

interface FirebaseAuthDiagnosticProps {
  onClose: () => void;
}

export function FirebaseAuthDiagnostic({ onClose }: FirebaseAuthDiagnosticProps) {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testType, setTestType] = useState<'config' | 'signin' | 'domain' | 'sdk' | 'cache' | null>(null);

  // Run domain check on component mount
  const [domainCheck] = useState(() => checkFirebaseAuthDomain());
  const [sdkCheck] = useState(() => checkFirebaseSDKVersion());

  const runConfigCheck = async () => {
    setIsLoading(true);
    setTestType('config');
    try {
      const checkResult = await checkFirebaseAuth();
      setResults(checkResult);
    } catch (error: any) {
      setResults({
        success: false,
        message: `Error running check: ${error.message}`,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runSignInTest = async () => {
    setIsLoading(true);
    setTestType('signin');
    try {
      const signInResult = await testGoogleSignIn();
      setResults(signInResult);
    } catch (error: any) {
      setResults({
        success: false,
        message: `Error running sign-in test: ${error.message}`,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setResults({
        success: true,
        message: 'Successfully signed out'
      });
    } catch (error: any) {
      setResults({
        success: false,
        message: `Error signing out: ${error.message}`,
        error
      });
    }
  };

  const showDomainCheck = () => {
    setTestType('domain');
    setResults({
      success: domainCheck.isAuthorized,
      message: domainCheck.isAuthorized
        ? `Domain ${domainCheck.currentDomain} is authorized for Firebase Authentication`
        : `Domain ${domainCheck.currentDomain} is NOT authorized for Firebase Authentication`,
      details: {
        currentDomain: domainCheck.currentDomain,
        authDomain: domainCheck.authDomain,
        instructions: domainCheck.instructions
      }
    });
  };

  const showSdkCheck = () => {
    setTestType('sdk');
    setResults({
      success: sdkCheck.isCompatible,
      message: sdkCheck.isCompatible
        ? `Firebase SDK version ${sdkCheck.version} is compatible`
        : `Firebase SDK version ${sdkCheck.version} may be outdated`,
      details: {
        version: sdkCheck.version,
        recommendations: sdkCheck.recommendations
      }
    });
  };

  const showCacheInstructions = () => {
    setTestType('cache');
    setResults({
      success: true,
      message: 'Cache clearing and incognito mode instructions',
      details: {
        instructions: getCacheClearingInstructions()
      }
    });
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="bg-gray-300 p-4 max-h-[80vh] overflow-y-auto">
      <h2 className="font-mono text-lg font-bold mb-4 border-b border-gray-400 pb-2">
        Firebase Authentication Diagnostic
      </h2>

      <div className="space-y-4">
        <div className="mb-4">
          <h3 className="font-mono font-bold mb-2">1. Check Configuration</h3>
          <div className="flex flex-wrap gap-2">
            <Win95Button
              onClick={runConfigCheck}
              disabled={isLoading}
              className="px-4 py-2 font-mono"
            >
              Check Firebase Auth Config
            </Win95Button>

            <Win95Button
              onClick={showDomainCheck}
              disabled={isLoading}
              className={`px-4 py-2 font-mono ${!domainCheck.isAuthorized ? 'bg-red-100' : ''}`}
            >
              Check Domain Authorization
            </Win95Button>

            <Win95Button
              onClick={showSdkCheck}
              disabled={isLoading}
              className="px-4 py-2 font-mono"
            >
              Check Firebase SDK Version
            </Win95Button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-mono font-bold mb-2">2. Test Authentication</h3>
          <div className="flex flex-wrap gap-2">
            <Win95Button
              onClick={runSignInTest}
              disabled={isLoading}
              className="px-4 py-2 font-mono"
            >
              Test Google Sign-In
            </Win95Button>

            {auth.currentUser && (
              <Win95Button
                onClick={handleSignOut}
                disabled={isLoading}
                className="px-4 py-2 font-mono"
              >
                Sign Out
              </Win95Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-mono font-bold mb-2">3. Troubleshooting</h3>
          <div className="flex flex-wrap gap-2">
            <Win95Button
              onClick={showCacheInstructions}
              disabled={isLoading}
              className="px-4 py-2 font-mono"
            >
              Cache Clearing Instructions
            </Win95Button>
          </div>
        </div>

        {isLoading && (
          <div className="bg-blue-100 border-2 border-blue-400 p-4">
            <p className="font-mono">Running {testType === 'config' ? 'configuration check' : 'sign-in test'}...</p>
          </div>
        )}

        {results && (
          <div className={`border-2 p-4 ${results.success ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
            <h3 className="font-mono font-bold mb-2">
              {results.success ? '✓ Success' : '✗ Error'}
            </h3>
            <p className="font-mono mb-2">{results.message}</p>

            {results.details && (
              <div className="mt-4">
                <h4 className="font-mono font-bold mb-2">Details:</h4>
                <pre className="bg-white p-2 border border-gray-400 rounded overflow-x-auto text-xs font-mono">
                  {formatJson(results.details)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-400">
          <h3 className="font-mono font-bold mb-2">Current Auth State:</h3>
          <pre className="bg-white p-2 border border-gray-400 rounded overflow-x-auto text-xs font-mono">
            {auth.currentUser ? formatJson({
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              displayName: auth.currentUser.displayName,
              photoURL: auth.currentUser.photoURL,
              emailVerified: auth.currentUser.emailVerified,
              providerId: auth.currentUser.providerId,
            }) : 'Not signed in'}
          </pre>
        </div>

        <div className="flex justify-end mt-4">
          <Win95Button onClick={onClose} className="px-4 py-2 font-mono">
            Close
          </Win95Button>
        </div>
      </div>
    </div>
  );
}
