import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../firebase/config';
import { StarIcon, RefreshCwIcon } from 'lucide-react';
import { ref, get, onValue } from 'firebase/database';
import { useContent } from '../contexts/ContentContext';
import { LazyImage } from './LazyImage';

interface Review {
  id: string;
  name: string;
  review: string;
  rating: number;
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

export const TestimonialsSection: React.FC = () => {
  const { content } = useContent();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const reviewsRef = useRef<Review[]>([]);

  // Get settings from content or use defaults
  const defaultSettings: TestimonialSettings = {
    displayMode: 'grid',
    autoRotate: true,
    rotationSpeed: 5,
    showRating: true,
    maxDisplayCount: 10,
    backgroundColor: '#f0f0f0',
    textColor: '#333333',
    accentColor: '#3B82F6'
  };

  const settings: TestimonialSettings = {
    ...defaultSettings,
    ...content.testimonialSettings
  };

  // Keep a ref to the latest reviews for use in callbacks
  useEffect(() => {
    reviewsRef.current = reviews;
  }, [reviews]);

  // Process reviews data from Firebase
  const processReviewsData = useCallback((reviewsData: any) => {
    try {
      if (!reviewsData || typeof reviewsData !== 'object') {
        return [];
      }

      const reviewsArray = Object.values(reviewsData) as Review[];

      // Filter to only approved reviews
      const approvedReviews = reviewsArray.filter(review => {
        if (!review || typeof review !== 'object') {
          return false;
        }

        // Handle different data types for the approved property
        const isApproved =
          review.approved === true ||
          review.approved === 'true' ||
          review.approved === 1 ||
          review.approved === '1';

        if (!isApproved) {
          return false;
        }

        // Check if the review has all required fields
        if (!review.id || !review.name || typeof review.rating !== 'number') {
          return false;
        }

        // Check specifically for review text
        if (!review.review || review.review.trim() === '') {
          return false;
        }

        return true;
      });

      // Sort reviews - featured first, then by position, then by date
      const sortedReviews = approvedReviews.sort((a, b) => {
        // First prioritize featured reviews
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;

        // Then sort by position if available
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

      return sortedReviews;
    } catch (error) {
      console.error('Error processing reviews data:', error);
      return [];
    }
  }, []);

  // Manual refresh function
  const refreshReviews = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const reviewsDbRef = ref(database, 'reviews');
      const snapshot = await get(reviewsDbRef);

      if (snapshot.exists()) {
        const reviewsData = snapshot.val();
        const processedReviews = processReviewsData(reviewsData);
        setReviews(processedReviews);
        setReviewCount(Object.keys(reviewsData).length);
      } else {
        setReviews([]);
        setReviewCount(0);
      }
    } catch (error) {
      console.error('Error refreshing reviews:', error);
      setError('Failed to refresh reviews');
    } finally {
      setRefreshing(false);
    }
  }, [processReviewsData]);

  // Initial load and real-time subscription
  useEffect(() => {
    const reviewsDbRef = ref(database, 'reviews');

    const unsubscribe = onValue(reviewsDbRef, (snapshot) => {
      try {
        setLoading(true);
        setError(null);

        if (snapshot.exists()) {
          const reviewsData = snapshot.val();
          const processedReviews = processReviewsData(reviewsData);
          setReviews(processedReviews);
          setReviewCount(Object.keys(reviewsData).length);
        } else {
          setReviews([]);
          setReviewCount(0);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Firebase subscription error:', error);
      setError('Failed to connect to reviews database');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [processReviewsData]);

  // Auto-rotation for carousel
  useEffect(() => {
    if (settings.displayMode === 'carousel' && settings.autoRotate && reviews.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reviews.length);
      }, settings.rotationSpeed * 1000);

      return () => clearInterval(interval);
    }
  }, [settings.displayMode, settings.autoRotate, settings.rotationSpeed, reviews.length]);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: settings.backgroundColor }}>
        <h2 className="text-2xl font-bold font-mono mb-6 text-center flex items-center justify-center">
          <StarIcon className="w-6 h-6 mr-2" style={{ color: settings.accentColor }} />
          <span style={{ color: settings.textColor }}>What Our Clients Say</span>
        </h2>
        <div className="flex items-center justify-center">
          <RefreshCwIcon className="w-6 h-6 animate-spin mr-2" style={{ color: settings.accentColor }} />
          <span style={{ color: settings.textColor }}>Loading reviews...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: settings.backgroundColor }}>
        <h2 className="text-2xl font-bold font-mono mb-6 text-center flex items-center justify-center">
          <StarIcon className="w-6 h-6 mr-2" style={{ color: settings.accentColor }} />
          <span style={{ color: settings.textColor }}>What Our Clients Say</span>
        </h2>
        <div className="max-w-md mx-auto p-6 border-2 rounded-lg" style={{ borderColor: '#ef4444' }}>
          <p className="font-mono mb-4" style={{ color: '#ef4444' }}>
            {error}
          </p>
          <button
            onClick={refreshReviews}
            disabled={refreshing}
            className="px-4 py-2 text-sm border rounded flex items-center justify-center mx-auto"
            style={{
              borderColor: settings.accentColor,
              color: settings.accentColor,
              backgroundColor: `${settings.accentColor}10`
            }}
          >
            {refreshing ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Try again
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="p-8 text-center" style={{ backgroundColor: settings.backgroundColor }}>
        <h2 className="text-2xl font-bold font-mono mb-6 text-center flex items-center justify-center">
          <StarIcon className="w-6 h-6 mr-2" style={{ color: settings.accentColor }} />
          <span style={{ color: settings.textColor }}>What Our Clients Say</span>
        </h2>
        <div className="max-w-md mx-auto p-6 border-2 rounded-lg" style={{ borderColor: settings.accentColor }}>
          <p className="font-mono mb-2" style={{ color: settings.textColor }}>
            No approved reviews available yet. Be the first to share your experience!
          </p>
          {reviewCount > 0 && (
            <p className="font-mono text-sm opacity-70" style={{ color: settings.textColor }}>
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} pending approval.
            </p>
          )}
          <button
            onClick={refreshReviews}
            disabled={refreshing}
            className="mt-4 px-4 py-2 text-sm border rounded flex items-center justify-center mx-auto"
            style={{
              borderColor: settings.accentColor,
              color: settings.accentColor,
              backgroundColor: `${settings.accentColor}10`
            }}
          >
            {refreshing ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Checking for new reviews...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Check for new reviews
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Render reviews
  return (
    <div className="p-8" style={{ backgroundColor: settings.backgroundColor }}>
      <h2 className="text-2xl font-bold font-mono mb-6 text-center flex items-center justify-center">
        <StarIcon className="w-6 h-6 mr-2" style={{ color: settings.accentColor }} />
        <span style={{ color: settings.textColor }}>What Our Clients Say</span>
      </h2>

      {/* Reviews Row-by-Row Display */}
      <div className="max-w-4xl mx-auto space-y-6">
        <AnimatePresence mode="popLayout">
          {reviews.slice(0, settings.maxDisplayCount).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="relative bg-white rounded-xl shadow-lg border-2 overflow-hidden"
              style={{
                borderColor: settings.accentColor,
              }}
              layout
            >
              {/* Featured badge */}
              {review.featured && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <StarIcon className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </span>
                </motion.div>
              )}

              <div className="p-6 sm:p-8">
                {/* Header section with avatar, name, and rating */}
                <div className="flex items-start space-x-4 mb-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {review.avatar ? (
                      <LazyImage
                        src={review.avatar}
                        alt={review.name}
                        className="w-16 h-16 rounded-full object-cover border-3 shadow-md"
                        style={{ borderColor: settings.accentColor }}
                        placeholderSize="20px"
                        transitionDuration="0.8s"
                        initialOpacity={0.7}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md border-3"
                        style={{
                          backgroundColor: settings.accentColor,
                          borderColor: settings.accentColor
                        }}
                      >
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Name, company, and rating */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {review.name}
                        </h3>
                        {review.company && (
                          <p className="text-base text-gray-600 mb-2">
                            {review.company}
                          </p>
                        )}
                      </div>

                      {/* Rating and date */}
                      <div className="flex flex-col items-start sm:items-end space-y-2">
                        {settings.showRating && (
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              ({review.rating}/5)
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500">
                          {review.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review content */}
                <div className="relative">
                  <div className="absolute -left-2 top-0 text-6xl text-gray-200 font-serif leading-none">
                    "
                  </div>
                  <div className="pl-8">
                    <p className="text-gray-700 text-lg leading-relaxed font-medium">
                      {review.review}
                    </p>
                  </div>
                  <div className="absolute -right-2 bottom-0 text-6xl text-gray-200 font-serif leading-none">
                    "
                  </div>
                </div>
              </div>

              {/* Bottom accent bar */}
              <div
                className="h-1 w-full"
                style={{ backgroundColor: settings.accentColor }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
