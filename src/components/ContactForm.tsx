import React, { useState, useEffect } from 'react';
// Direct Firebase imports - proven stable approach
import { ref, set } from 'firebase/database';
import { database, auth } from '../firebase/config';
// Direct Firebase Auth import - bypassing AuthContext
import { onAuthStateChanged, User } from 'firebase/auth';

export function ContactForm({
  onClose
}: {
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Direct Firebase Auth listener - bypassing AuthContext completely
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated using direct Firebase Auth
    if (!user) {
      alert('Please sign in with Google to submit a contact form.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate a simple ID for the contact submission
      const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create contact submission object with user data from Firebase Auth
      const contactSubmission = {
        id: contactId,
        name: user.displayName || 'Unknown User',
        email: user.email || 'no-email@example.com',
        subject,
        message: message.trim(),
        submittedAt: new Date().toISOString(),
        status: 'new',
        source: 'direct_auth_form'
      };

      // Save directly to Firebase using proven stable approach
      await set(ref(database, `contactSubmissions/${contactId}`), contactSubmission);

      console.log('Contact form saved successfully:', contactId);

      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving contact form:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 bg-gray-200 text-center">
        <div className="bg-green-100 border-2 border-green-600 p-6 shadow-lg">
          <h3 className="font-mono font-bold text-green-800 text-lg mb-2">
            Message Sent Successfully!
          </h3>
          <p className="font-mono text-green-700">
            We'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    );
  }

  // Show authentication requirement if not signed in
  if (!user) {
    return (
      <div className="space-y-4 p-4 bg-gray-200">
        <h3 className="font-mono font-bold text-lg mb-4">Contact Us</h3>
        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 shadow-lg">
          <h4 className="font-mono font-bold text-yellow-800 mb-2">
            🔐 Sign In Required
          </h4>
          <p className="font-mono text-yellow-700 mb-3">
            Please sign in with your Google account to send us a message. This helps us respond to you more effectively and prevents spam.
          </p>
          <p className="font-mono text-sm text-yellow-600">
            Use the "Sign In" button in the start menu to authenticate with Google.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-gray-200">
      <h3 className="font-mono font-bold text-lg mb-4">Contact Us</h3>

      {/* User Profile Preview */}
      <div className="bg-blue-100 border-2 border-blue-600 p-3 shadow-lg">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-blue-600"
            />
          )}
          <div>
            <p className="font-mono font-bold text-blue-800">{user.displayName || 'User'}</p>
            <p className="font-mono text-sm text-blue-600">{user.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-mono">Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 font-mono border-2 border-gray-600 bg-white"
            disabled={isSubmitting}
          >
            <option>General Inquiry</option>
            <option>Technical Support</option>
            <option>Business Proposal</option>
            <option>Partnership Opportunity</option>
            <option>Project Quote Request</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-mono">Message:</label>
          <textarea
            rows={6}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 font-mono border-2 border-gray-600 bg-white resize-none"
            placeholder="Please describe your inquiry or project requirements in detail..."
            minLength={10}
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="text-xs font-mono text-gray-500 mt-1">
            {message.length}/1000 characters {message.length < 10 && `(${10 - message.length} more required)`}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 font-mono font-bold bg-gray-300 border-2 border-gray-600 hover:bg-gray-400 disabled:bg-gray-200"
            disabled={!message || message.length < 10 || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
}