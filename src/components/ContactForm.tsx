import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon } from 'lucide-react';
import { addContactSubmission as addFirebaseContactSubmission } from '../firebase/contentDatabase';
import { AuthRequiredWrapper } from './AuthRequiredWrapper';
import { ProfilePreview } from './ProfilePreview';

export function ContactForm({
  onClose
}: {
  onClose: () => void;
}) {
  const { addContactSubmission } = useContent();
  const { getUserProfileData } = useAuth();
  const [formData, setFormData] = useState({
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user profile data
  const profileData = getUserProfileData();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData) {
      alert('Please sign in to submit a contact form.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Use Firebase to add the contact submission with authenticated user data
      const submissionData = {
        name: profileData.name,
        email: profileData.email,
        subject: formData.subject,
        message: formData.message.trim(),
        userId: profileData.uid, // Add user ID for tracking
        userPhotoURL: profileData.photoURL // Add photo URL for admin reference
      };

      await addContactSubmission(submissionData);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  if (submitted) {
    return <div className="p-8 bg-gray-200 text-center">
        <div className="bg-green-100 border-2 border-green-600 p-6 shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="font-mono font-bold text-green-800 text-lg mb-2">
            Message Sent Successfully!
          </h3>
          <p className="font-mono text-green-700">
            We'll get back to you as soon as possible.
          </p>
        </div>
      </div>;
  }
  // Wrap the form in authentication requirement
  return (
    <AuthRequiredWrapper
      title="Sign In to Contact Us"
      description="Please sign in with your Google account to send us a message. This helps us respond to you more effectively and prevents spam."
      icon="contact"
    >
      <div className="space-y-4">
        {/* User Profile Preview */}
        <ProfilePreview
          showEmail={true}
          className="mb-4"
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Field */}
          <div>
            <label className="block mb-1 font-mono">Subject:</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
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

          {/* Message Field */}
          <div>
            <label className="block mb-1 font-mono">Message:</label>
            <textarea
              name="message"
              rows={6}
              required
              value={formData.message}
              onChange={handleChange}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              placeholder="Please describe your inquiry or project requirements in detail..."
              minLength={10}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="text-xs font-mono text-gray-500 mt-1">
              {formData.message.length}/1000 characters {formData.message.length < 10 && `(${10 - formData.message.length} more required)`}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Win95Button
              type="submit"
              className="px-6 py-2 font-mono font-bold"
              disabled={!formData.message || formData.message.length < 10 || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Win95Button>
          </div>
        </form>
      </div>
    </AuthRequiredWrapper>
  );
}