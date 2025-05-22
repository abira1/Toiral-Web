import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { CheckIcon } from 'lucide-react';
import { addReview } from '../firebase/contentDatabase';
export function ReviewForm() {
  const {
    content,
    updateContent
  } = useContent();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [avatar, setAvatar] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use Firebase to add the review
      await addReview({
        name,
        company,
        avatar,
        rating,
        review
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setCompany('');
        setAvatar('');
        setRating(5);
        setReview('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
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
  return <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block mb-1 font-mono">Your Name:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" required minLength={2} maxLength={50} />
      </div>
      <div>
        <label className="block mb-1 font-mono">Company/Organization (Optional):</label>
        <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="Your company or organization" />
      </div>
      <div>
        <label className="block mb-1 font-mono">Profile Picture URL (Optional):</label>
        <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="https://example.com/your-image.jpg" />
      </div>
      <div>
        <label className="block mb-1 font-mono">Rating:</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" className={`text-2xl focus:outline-none transition-colors duration-150
                ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}
                hover:text-yellow-400`} onClick={() => setRating(star)}>
              ★
            </button>)}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-mono">Your Review:</label>
        <textarea value={review} onChange={e => setReview(e.target.value)} rows={3} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none" required minLength={10} maxLength={500} placeholder="Please share your experience (minimum 10 characters)" />
      </div>
      <div className="flex justify-end">
        <Win95Button type="submit" className="px-4 py-2 font-mono" disabled={!name || !review || review.length < 10}>
          Submit Review
        </Win95Button>
      </div>
    </form>;
}