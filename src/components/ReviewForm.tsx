import React, { useState, useEffect } from 'react';
// Direct Firebase imports - proven stable approach
import { ref, set } from 'firebase/database';
import { database, auth } from '../firebase/config';
// Direct Firebase Auth import - bypassing AuthContext
import { onAuthStateChanged, User } from 'firebase/auth';

export function ReviewForm() {
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      alert('Please sign in with Google to submit a review.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate a simple ID for the review
      const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create review object with user data from Firebase Auth
      const reviewSubmission = {
        id: reviewId,
        name: user.displayName || 'Unknown User',
        rating,
        review: review.trim(),
        company: company.trim() || undefined,
        avatar: user.photoURL || undefined,
        approved: false, // Reviews need approval
        date: new Date().toISOString(),
        source: 'direct_auth_form'
      };

      // Save directly to Firebase using proven stable approach
      await set(ref(database, `reviews/${reviewId}`), reviewSubmission);

      console.log('Review saved successfully:', reviewId);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setCompany('');
        setRating(5);
        setReview('');
      }, 3000);
    } catch (error) {
      console.error('Error saving review:', error);
      alert('There was an error submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (submitted) {
    return (
      <div className="p-4 bg-gray-200 text-center">
        <div className="bg-green-100 border-2 border-green-600 p-6 shadow-lg">
          <h3 className="font-mono font-bold text-green-800 text-lg mb-2">
            Thank You for Your Review!
          </h3>
          <p className="font-mono text-green-700">
            Your review has been submitted and will be visible after approval.
          </p>
        </div>
      </div>
    );
  }

  // Show authentication requirement if not signed in
  if (!user) {
    return (
      <div className="space-y-4 p-4 bg-gray-200">
        <h3 className="font-mono font-bold text-lg mb-4">Submit Review</h3>
        <div className="bg-yellow-100 border-2 border-yellow-600 p-4 shadow-lg">
          <h4 className="font-mono font-bold text-yellow-800 mb-2">
            🔐 Sign In Required
          </h4>
          <p className="font-mono text-yellow-700 mb-3">
            Please sign in with your Google account to submit a review. This helps us verify authentic feedback and automatically fills in your profile information.
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
      <h3 className="font-mono font-bold text-lg mb-4">Submit Review</h3>

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
            <p className="font-mono text-sm text-blue-600">Submitting as verified user</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 font-mono">Company/Organization (Optional):</label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full p-1 font-mono border-2 border-gray-600 bg-white"
            placeholder="Your company or organization"
            maxLength={100}
          />
        </div>

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
                ⭐
              </button>
            ))}
            <span className="ml-2 font-mono text-sm text-gray-600 self-center">
              ({rating}/5)
            </span>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-mono">Your Review:</label>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            rows={4}
            className="w-full p-2 font-mono border-2 border-gray-600 bg-white resize-none"
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

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 font-mono font-bold bg-gray-300 border-2 border-gray-600 hover:bg-gray-400 disabled:bg-gray-200"
            disabled={!review || review.length < 10 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}