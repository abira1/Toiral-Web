import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Win95Button } from './Win95Button';
import { KeyIcon, UserIcon, AlertTriangleIcon, LockIcon } from 'lucide-react';
export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {
    login,
    failedAttempts,
    isLocked,
    remainingLockTime
  } = useAuth();
  const navigate = useNavigate();
  const [lockTimeDisplay, setLockTimeDisplay] = useState('');
  useEffect(() => {
    if (isLocked) {
      const timer = setInterval(() => {
        const minutes = Math.floor(remainingLockTime / 60000);
        const seconds = Math.floor(remainingLockTime % 60000 / 1000);
        setLockTimeDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, remainingLockTime]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLocked) {
      setError(`Account is locked. Please try again in ${lockTimeDisplay}`);
      return;
    }
    if (login(username, password)) {
      navigate('/admin');
    } else {
      const remainingAttempts = 5 - (failedAttempts + 1);
      setError(remainingAttempts > 0 ? `Invalid credentials. ${remainingAttempts} attempts remaining.` : 'Too many failed attempts. Account is now locked.');
    }
  };
  return <div className="w-full h-screen bg-teal-600 flex items-center justify-center">
      <div className="w-96 bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4">
        <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4">
          Admin Login
        </div>
        {isLocked ? <div className="bg-red-100 border-2 border-red-600 p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700 font-mono">
              <LockIcon className="w-5 h-5" />
              <span>Account is temporarily locked</span>
            </div>
            <div className="mt-2 font-mono text-sm text-red-600">
              Please try again in: {lockTimeDisplay}
            </div>
          </div> : <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 border-2 border-red-400 p-3">
                <div className="flex items-center gap-2 text-red-700 font-mono">
                  <AlertTriangleIcon className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>}
            <div>
              <label className="block mb-1 font-mono">Username:</label>
              <div className="flex">
                <div className="bg-white p-2 border-2 border-gray-600 border-r-0 border-t-gray-800 border-l-gray-800">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-mono">Password:</label>
              <div className="flex">
                <div className="bg-white p-2 border-2 border-gray-600 border-r-0 border-t-gray-800 border-l-gray-800">
                  <KeyIcon className="w-5 h-5" />
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" />
              </div>
            </div>
            <div className="flex justify-end">
              <Win95Button type="submit" className="px-8 py-2 font-mono">
                Login
              </Win95Button>
            </div>
          </form>}
      </div>
    </div>;
}