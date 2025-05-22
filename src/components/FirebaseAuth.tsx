import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { auth } from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';

export function FirebaseAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setActiveTab('profile');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      setPassword('');
      setMessage('Logged in successfully!');
    } catch (err) {
      setError('Login failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      setPassword('');
      setMessage('Account created successfully!');
    } catch (err) {
      setError('Registration failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setActiveTab('login');
      setMessage('Logged out successfully!');
    } catch (err) {
      setError('Logout failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError('Password reset failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-md mx-auto">
        <h2 className="font-mono text-xl font-bold mb-4">Firebase Authentication</h2>
        
        {/* Error and message display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <p>{error}</p>
            <Win95Button 
              onClick={() => setError(null)} 
              className="mt-2 px-2 py-1 font-mono text-sm"
            >
              Dismiss
            </Win95Button>
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700">
            <p>{message}</p>
            <Win95Button 
              onClick={() => setMessage(null)} 
              className="mt-2 px-2 py-1 font-mono text-sm"
            >
              Dismiss
            </Win95Button>
          </div>
        )}
        
        {/* Tabs */}
        {!currentUser && (
          <div className="flex mb-4 border-b-2 border-gray-400">
            <Win95Button 
              onClick={() => setActiveTab('login')} 
              className={`px-4 py-2 font-mono ${activeTab === 'login' ? 'bg-blue-100' : ''}`}
            >
              Login
            </Win95Button>
            <Win95Button 
              onClick={() => setActiveTab('register')} 
              className={`px-4 py-2 font-mono ${activeTab === 'register' ? 'bg-blue-100' : ''}`}
            >
              Register
            </Win95Button>
          </div>
        )}
        
        {/* Login Form */}
        {activeTab === 'login' && !currentUser && (
          <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800">
            <h3 className="font-mono font-bold mb-4">Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-mono mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 font-mono"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block font-mono mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 font-mono"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-between">
                <Win95Button 
                  type="submit" 
                  className="px-4 py-2 font-mono"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Win95Button>
                <Win95Button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="px-4 py-2 font-mono"
                  disabled={loading}
                >
                  Reset Password
                </Win95Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Register Form */}
        {activeTab === 'register' && !currentUser && (
          <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800">
            <h3 className="font-mono font-bold mb-4">Register</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block font-mono mb-1">Display Name (optional)</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 font-mono"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block font-mono mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 font-mono"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block font-mono mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 font-mono"
                  disabled={loading}
                />
                <p className="text-xs font-mono mt-1 text-gray-600">
                  Password must be at least 6 characters
                </p>
              </div>
              <Win95Button 
                type="submit" 
                className="px-4 py-2 font-mono"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Win95Button>
            </form>
          </div>
        )}
        
        {/* User Profile */}
        {currentUser && (
          <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800">
            <h3 className="font-mono font-bold mb-4">User Profile</h3>
            <div className="space-y-4">
              <div>
                <p className="font-mono">
                  <strong>Display Name:</strong> {currentUser.displayName || 'Not set'}
                </p>
                <p className="font-mono">
                  <strong>Email:</strong> {currentUser.email}
                </p>
                <p className="font-mono">
                  <strong>Email Verified:</strong> {currentUser.emailVerified ? 'Yes' : 'No'}
                </p>
                <p className="font-mono">
                  <strong>User ID:</strong> {currentUser.uid}
                </p>
              </div>
              <Win95Button 
                onClick={handleLogout} 
                className="px-4 py-2 font-mono bg-red-100"
                disabled={loading}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </Win95Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
