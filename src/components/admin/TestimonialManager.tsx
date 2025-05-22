import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { useContent } from '../../contexts/ContentContext';
import { database } from '../../firebase/config';
import { ref, set } from 'firebase/database';
import { StarIcon, TrashIcon, CheckIcon, XIcon, PlusIcon, RefreshCwIcon, AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { LazyImage } from '../LazyImage';

interface Review {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
  featured?: boolean;
  position?: number;
  company?: string;
  avatar?: string;
}

interface TestimonialSettings {
  displayMode: 'grid' | 'carousel' | 'list';
  autoRotate: boolean;
  rotationSpeed: number;
  showRating: boolean;
  maxDisplayCount: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export function TestimonialManager() {
  const { content, updateContent } = useContent();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<TestimonialSettings>({
    displayMode: 'grid',
    autoRotate: true,
    rotationSpeed: 5,
    showRating: true,
    maxDisplayCount: 6,
    backgroundColor: '#f0f0f0',
    textColor: '#333333',
    accentColor: '#3B82F6'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'settings'>('reviews');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'featured'>('all');

  // Load reviews from content
  useEffect(() => {
    if (content.reviews && Array.isArray(content.reviews)) {
      // Sort reviews by date (newest first) and then by position if available
      const sortedReviews = [...content.reviews].sort((a, b) => {
        // First sort by position if available
        if (a.position !== undefined && b.position !== undefined) {
          return a.position - b.position;
        }

        // Then sort by date (newest first)
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (error) {
          return 0;
        }
      });

      setReviews(sortedReviews);
    }

    // Load testimonial settings if available
    if (content.testimonialSettings) {
      setSettings(content.testimonialSettings);
    }
  }, [content]);

  // Filter reviews based on selected filter
  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'approved') return review.approved;
    if (filter === 'pending') return !review.approved;
    if (filter === 'featured') return review.featured;
    return true;
  });

  // Handle review approval
  const handleApproveReview = async (id: string) => {
    try {
      setLoading(true);

      // Update in Firebase
      await set(ref(database, `reviews/${id}/approved`), true);

      // Update local state
      const updatedReviews = reviews.map(review =>
        review.id === id ? { ...review, approved: true } : review
      );

      setReviews(updatedReviews);
      updateContent({ reviews: updatedReviews });

      setSuccess('Review approved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error approving review:', error);
      setError('Failed to approve review');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle review removal
  const handleRemoveReview = async (id: string) => {
    if (!confirm('Are you sure you want to remove this review?')) return;

    try {
      setLoading(true);

      // Remove from Firebase
      await set(ref(database, `reviews/${id}`), null);

      // Update local state
      const updatedReviews = reviews.filter(review => review.id !== id);

      setReviews(updatedReviews);
      updateContent({ reviews: updatedReviews });

      setSuccess('Review removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing review:', error);
      setError('Failed to remove review');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (id: string) => {
    try {
      setLoading(true);

      // Find the review
      const review = reviews.find(r => r.id === id);
      if (!review) return;

      // Toggle featured status
      const featured = !review.featured;

      // Update in Firebase
      await set(ref(database, `reviews/${id}/featured`), featured);

      // Update local state
      const updatedReviews = reviews.map(r =>
        r.id === id ? { ...r, featured } : r
      );

      setReviews(updatedReviews);
      updateContent({ reviews: updatedReviews });

      setSuccess(`Review ${featured ? 'featured' : 'unfeatured'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setError('Failed to update review');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Move review up in order
  const handleMoveUp = async (id: string) => {
    try {
      setLoading(true);

      // Find the review and its index
      const index = reviews.findIndex(r => r.id === id);
      if (index <= 0) return; // Already at the top

      // Create a copy of the reviews array
      const updatedReviews = [...reviews];

      // Update positions
      if (updatedReviews[index].position === undefined) {
        // Initialize positions if they don't exist
        updatedReviews.forEach((r, i) => {
          r.position = i;
        });
      }

      // Swap positions
      const temp = updatedReviews[index].position;
      updatedReviews[index].position = updatedReviews[index - 1].position;
      updatedReviews[index - 1].position = temp;

      // Swap the elements
      [updatedReviews[index], updatedReviews[index - 1]] = [updatedReviews[index - 1], updatedReviews[index]];

      // Update in Firebase
      for (const review of [updatedReviews[index - 1], updatedReviews[index]]) {
        await set(ref(database, `reviews/${review.id}/position`), review.position);
      }

      // Update local state
      setReviews(updatedReviews);
      updateContent({ reviews: updatedReviews });

      setSuccess('Review order updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error moving review:', error);
      setError('Failed to update review order');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Move review down in order
  const handleMoveDown = async (id: string) => {
    try {
      setLoading(true);

      // Find the review and its index
      const index = reviews.findIndex(r => r.id === id);
      if (index === -1 || index >= reviews.length - 1) return; // Already at the bottom

      // Create a copy of the reviews array
      const updatedReviews = [...reviews];

      // Update positions
      if (updatedReviews[index].position === undefined) {
        // Initialize positions if they don't exist
        updatedReviews.forEach((r, i) => {
          r.position = i;
        });
      }

      // Swap positions
      const temp = updatedReviews[index].position;
      updatedReviews[index].position = updatedReviews[index + 1].position;
      updatedReviews[index + 1].position = temp;

      // Swap the elements
      [updatedReviews[index], updatedReviews[index + 1]] = [updatedReviews[index + 1], updatedReviews[index]];

      // Update in Firebase
      for (const review of [updatedReviews[index], updatedReviews[index + 1]]) {
        await set(ref(database, `reviews/${review.id}/position`), review.position);
      }

      // Update local state
      setReviews(updatedReviews);
      updateContent({ reviews: updatedReviews });

      setSuccess('Review order updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error moving review:', error);
      setError('Failed to update review order');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update review field
  const handleUpdateReview = async (id: string, field: keyof Review, value: any) => {
    try {
      // Update in Firebase
      await set(ref(database, `reviews/${id}/${field}`), value);

      // Update local state
      const updatedReviews = reviews.map(review =>
        review.id === id ? { ...review, [field]: value } : review
      );

      setReviews(updatedReviews);
      updateContent({ reviews: updatedReviews });
    } catch (error) {
      console.error(`Error updating review ${field}:`, error);
      setError(`Failed to update review ${field}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Save testimonial settings
  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      // Save to Firebase
      await set(ref(database, 'testimonialSettings'), settings);

      // Update content context
      updateContent({ testimonialSettings: settings });

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update a setting
  const handleUpdateSetting = (field: keyof TestimonialSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono flex items-center">
          <StarIcon className="w-5 h-5 mr-2" />
          Testimonial Manager
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700 flex items-center">
          <AlertTriangleIcon className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700 flex items-center">
          <CheckIcon className="w-5 h-5 mr-2" />
          <p>{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-300">
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'reviews' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'settings' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Display Settings
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="border-2 border-gray-400 flex">
                <button
                  className={`px-3 py-1 font-mono text-sm ${filter === 'all' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 font-mono text-sm ${filter === 'approved' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setFilter('approved')}
                >
                  Approved
                </button>
                <button
                  className={`px-3 py-1 font-mono text-sm ${filter === 'pending' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button
                  className={`px-3 py-1 font-mono text-sm ${filter === 'featured' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setFilter('featured')}
                >
                  Featured
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500 font-mono">
              {filteredReviews.length} {filter !== 'all' ? filter : ''} reviews
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review, index) => (
                <div key={review.id} className="p-4 bg-white border-2 border-gray-400">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-mono font-bold">{review.name}</span>
                      {review.featured && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-mono rounded bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {review.approved ? (
                        <span className="ml-2 px-2 py-0.5 text-xs font-mono rounded bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 text-xs font-mono rounded bg-red-100 text-red-800">
                          Pending
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-sm">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                      <div className="mb-2 text-yellow-500">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <p className="font-mono text-sm mb-2">{review.review}</p>

                      <div className="mt-2">
                        <label className="block mb-1 font-mono text-xs text-gray-600">
                          Company/Organization (optional)
                        </label>
                        <input
                          type="text"
                          value={review.company || ''}
                          onChange={(e) => handleUpdateReview(review.id, 'company', e.target.value)}
                          className="w-full p-1 font-mono text-sm border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                          placeholder="Company or organization name"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="aspect-square relative border-2 border-gray-300 overflow-hidden mb-2">
                        <LazyImage
                          src={review.avatar || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E'}
                          alt={review.name}
                          className="w-full h-full object-cover"
                          placeholderSrc='data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E'
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E';
                          }}
                        />
                      </div>
                      <input
                        type="url"
                        value={review.avatar || ''}
                        onChange={(e) => handleUpdateReview(review.id, 'avatar', e.target.value)}
                        className="w-full p-1 font-mono text-sm border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                        placeholder="Avatar URL (optional)"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!review.approved && (
                      <Win95Button
                        onClick={() => handleApproveReview(review.id)}
                        className="px-3 py-1 font-mono text-sm flex items-center"
                        disabled={loading}
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Approve
                      </Win95Button>
                    )}

                    <Win95Button
                      onClick={() => handleToggleFeatured(review.id)}
                      className="px-3 py-1 font-mono text-sm flex items-center"
                      disabled={loading}
                    >
                      {review.featured ? (
                        <>
                          <EyeOffIcon className="w-4 h-4 mr-1" />
                          Unfeature
                        </>
                      ) : (
                        <>
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Feature
                        </>
                      )}
                    </Win95Button>

                    <Win95Button
                      onClick={() => handleMoveUp(review.id)}
                      className="px-3 py-1 font-mono text-sm flex items-center"
                      disabled={loading || index === 0}
                    >
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                      Move Up
                    </Win95Button>

                    <Win95Button
                      onClick={() => handleMoveDown(review.id)}
                      className="px-3 py-1 font-mono text-sm flex items-center"
                      disabled={loading || index === filteredReviews.length - 1}
                    >
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                      Move Down
                    </Win95Button>

                    <Win95Button
                      onClick={() => handleRemoveReview(review.id)}
                      className="px-3 py-1 font-mono text-sm flex items-center text-red-600"
                      disabled={loading}
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Remove
                    </Win95Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-white border-2 border-gray-400 text-center">
                <StarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="font-mono text-gray-600">No reviews available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-mono">Display Mode</label>
              <select
                value={settings.displayMode}
                onChange={(e) => handleUpdateSetting('displayMode', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              >
                <option value="grid">Grid</option>
                <option value="carousel">Carousel</option>
                <option value="list">List</option>
              </select>
            </div>

            {settings.displayMode === 'carousel' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRotate"
                  checked={settings.autoRotate}
                  onChange={(e) => handleUpdateSetting('autoRotate', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="autoRotate" className="font-mono">
                  Auto-rotate testimonials
                </label>
              </div>
            )}

            {settings.displayMode === 'carousel' && settings.autoRotate && (
              <div>
                <label className="block mb-1 font-mono">Rotation Speed (seconds)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.rotationSpeed}
                  onChange={(e) => handleUpdateSetting('rotationSpeed', parseInt(e.target.value))}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showRating"
                checked={settings.showRating}
                onChange={(e) => handleUpdateSetting('showRating', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showRating" className="font-mono">
                Show star ratings
              </label>
            </div>

            <div>
              <label className="block mb-1 font-mono">Maximum Testimonials to Display</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.maxDisplayCount}
                onChange={(e) => handleUpdateSetting('maxDisplayCount', parseInt(e.target.value))}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono">Background Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => handleUpdateSetting('backgroundColor', e.target.value)}
                  className="w-12 h-12 border-2 border-gray-600 mr-2"
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => handleUpdateSetting('backgroundColor', e.target.value)}
                  className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-mono">Text Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => handleUpdateSetting('textColor', e.target.value)}
                  className="w-12 h-12 border-2 border-gray-600 mr-2"
                />
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => handleUpdateSetting('textColor', e.target.value)}
                  className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-mono">Accent Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => handleUpdateSetting('accentColor', e.target.value)}
                  className="w-12 h-12 border-2 border-gray-600 mr-2"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => handleUpdateSetting('accentColor', e.target.value)}
                  className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Win95Button
              onClick={handleSaveSettings}
              className="px-4 py-2 font-mono flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Win95Button>
          </div>

          {/* Preview */}
          <div className="mt-6">
            <h3 className="font-mono font-bold mb-2">Preview</h3>
            <div
              className="p-4 border-2 border-gray-300 rounded"
              style={{ backgroundColor: settings.backgroundColor }}
            >
              <div className="text-center mb-4">
                <h4
                  className="font-mono font-bold text-lg"
                  style={{ color: settings.textColor }}
                >
                  Client Testimonials
                </h4>
              </div>

              <div className={`grid ${settings.displayMode === 'grid' ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-2'}`}>
                {reviews
                  .filter(review => review.approved)
                  .slice(0, settings.displayMode === 'carousel' ? 1 : settings.maxDisplayCount)
                  .map(review => (
                    <div
                      key={review.id}
                      className="p-3 border-2 border-gray-300 rounded"
                      style={{ borderColor: settings.accentColor }}
                    >
                      <div className="flex items-center mb-2">
                        {review.avatar && (
                          <LazyImage
                            src={review.avatar}
                            alt={review.name}
                            className="w-10 h-10 rounded-full mr-2 object-cover"
                            placeholderSrc='data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E'
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EAvatar%3C%2Ftext%3E%3C%2Fsvg%3E';
                            }}
                          />
                        )}
                        <div>
                          <div
                            className="font-mono font-bold"
                            style={{ color: settings.textColor }}
                          >
                            {review.name}
                          </div>
                          {review.company && (
                            <div
                              className="font-mono text-xs"
                              style={{ color: settings.textColor }}
                            >
                              {review.company}
                            </div>
                          )}
                        </div>
                      </div>

                      {settings.showRating && (
                        <div
                          className="mb-2"
                          style={{ color: settings.accentColor }}
                        >
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      )}

                      <p
                        className="font-mono text-sm"
                        style={{ color: settings.textColor }}
                      >
                        {review.review.length > 100
                          ? `${review.review.substring(0, 100)}...`
                          : review.review
                        }
                      </p>
                    </div>
                  ))}
              </div>

              {settings.displayMode === 'carousel' && (
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, reviews.filter(r => r.approved).length))].map((_, i) => (
                      <div
                        key={`carousel-dot-${i}`}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: i === 0 ? settings.accentColor : 'rgba(0,0,0,0.2)',
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
