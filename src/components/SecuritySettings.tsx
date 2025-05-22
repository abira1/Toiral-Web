import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangleIcon, CheckIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
export function SecuritySettings() {
  const {
    changePassword
  } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setStatus('error');
      setMessage('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      setStatus('error');
      setMessage('Password must contain at least one special character');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setStatus('error');
      setMessage('Password must contain at least one uppercase letter');
      return;
    }
    if (changePassword(currentPassword, newPassword)) {
      setStatus('success');
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else {
      setStatus('error');
      setMessage('Current password is incorrect');
    }
  };
  return <div className="p-4 bg-gray-200">
      <h3 className="font-mono font-bold text-lg mb-4">
        Change Admin Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-mono">Current Password:</label>
          <div className="flex">
            <div className="relative flex-1">
              <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 pr-10" required />
              <Win95Button className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-7 w-7 flex items-center justify-center" onClick={e => {
              e.preventDefault();
              setShowCurrentPassword(!showCurrentPassword);
            }}>
                {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </Win95Button>
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-mono">New Password:</label>
          <div className="flex">
            <div className="relative flex-1">
              <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 pr-10" required />
              <Win95Button className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-7 w-7 flex items-center justify-center" onClick={e => {
              e.preventDefault();
              setShowNewPassword(!showNewPassword);
            }}>
                {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </Win95Button>
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-mono">Confirm New Password:</label>
          <div className="flex">
            <div className="relative flex-1">
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 pr-10" required />
              <Win95Button className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-7 w-7 flex items-center justify-center" onClick={e => {
              e.preventDefault();
              setShowConfirmPassword(!showConfirmPassword);
            }}>
                {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </Win95Button>
            </div>
          </div>
        </div>
        {status !== 'idle' && <div className={`p-3 border-2 ${status === 'success' ? 'bg-green-100 border-green-600 text-green-700' : 'bg-red-100 border-red-600 text-red-700'}`}>
            <div className="flex items-center gap-2">
              {status === 'success' ? <CheckIcon className="w-5 h-5" /> : <AlertTriangleIcon className="w-5 h-5" />}
              <span className="font-mono">{message}</span>
            </div>
          </div>}
        <div className="pt-4 border-t border-gray-400">
          <div className="font-mono text-sm mb-4">
            Password requirements:
            <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-600">
              <li>At least 8 characters long</li>
              <li>Must contain at least one number</li>
              <li>Must contain at least one special character (!@#$%^&*)</li>
              <li>Must contain at least one uppercase letter</li>
            </ul>
          </div>
          <Win95Button type="submit" className="px-4 py-2 font-mono bg-blue-100 hover:bg-blue-200">
            Change Password
          </Win95Button>
        </div>
      </form>
    </div>;
}