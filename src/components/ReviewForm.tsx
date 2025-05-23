import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon, StarIcon } from 'lucide-react';
import { addReview as addFirebaseReview } from '../firebase/contentDatabase';
import { AuthRequiredWrapper } from './AuthRequiredWrapper';
import { ProfilePreview } from './ProfilePreview';

export function ReviewForm() {
  const { content, updateContent } = useContent();
  const { getUserProfileData } = useAuth();
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user profile data
  const profileData = getUserProfileData();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData) {
      alert('Please sign in to submit a review.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Use Firebase to add the review with authenticated user data
      await addFirebaseReview({
        name: profileData.name,
        company: company.trim() || undefined,
        avatar: profileData.photoURL || undefined,
        rating,
        review: review.trim(),
        userId: profileData.uid, // Add user ID for tracking
        userEmail: profileData.email // Add email for admin reference
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setCompany('');
        setRating(5);
        setReview('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (submitted) {
    return <div className="p-4 bg-gray-200 text-center">
        <div className="bg-green-100 border-2 border-green-600 p-6 shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="font-mono font-bold text-green-800 text-lg mb-2">
            Thank You for Your Review!
          </h3>
          <p className="font-mono text-green-700">
            Your review has been submitted and will be visible after approval.
          </p>
        </div>
      </div>;
  }
  // Wrap the form in authentication requirement
  return (
    <AuthRequiredWrapper
      title="Sign In to Submit Review"
      description="Please sign in with your Google account to submit a review. This helps us verify authentic feedback and automatically fills in your profile information."
      icon="review"
    >
      <div className="space-y-4">
        {/* User Profile Preview */}
        <ProfilePreview
          showEmail={false}
          className="mb-4"
        />

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Company Field */}
          <div>
            <label className="block mb-1 font-mono">Company/Organization (Optional):</label>
            <input
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Your company or organization"
              maxLength={100}
            />
          </div>

          {/* Rating Field */}
          <div>
            <label className="block mb-1 font-mono">Rating:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl focus:outline-none transition-colors duration-150 ${
                    rating >= star ? 'text-yellow-500' : 'text-gray-300'
                  } hover:text-yellow-400`}
                  onClick={() => setRating(star)}
                  disabled={isSubmitting}
                >
                  <StarIcon className="w-6 h-6 fill-current" />
                </button>
              ))}
              <span className="ml-2 font-mono text-sm text-gray-600 self-center">
                ({rating}/5)
              </span>
            </div>
          </div>

          {/* Review Text Field */}
          <div>
            <label className="block mb-1 font-mono">Your Review:</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={4}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              required
              minLength={10}
              maxLength={500}
              placeholder="Please share your experience with our services (minimum 10 characters)"
              disabled={isSubmitting}
            />
            <div className="text-xs font-mono text-gray-500 mt-1">
              {review.length}/500 characters {review.length < 10 && `(${10 - review.length} more required)`}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Win95Button
              type="submit"
              className="px-6 py-2 font-mono font-bold"
              disabled={!review || review.length < 10 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Win95Button>
          </div>
        </form>
      </div>
    </AuthRequiredWrapper>
  );
}