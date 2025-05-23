import { database } from '../firebase/config';
import { ref, get, remove, update } from 'firebase/database';

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

// Function to identify test/nonsensical reviews
function isTestReview(review: Review): boolean {
  if (!review || !review.name || !review.review) {
    return true; // Missing required fields
  }

  const testPatterns = [
    /^f+h*$/i, // Patterns like "fhhhhhhhhhhh", "fghfghgfh"
    /^h+f*$/i, // Patterns like "hffffffffffffffffffff"
    /^[fgh]+$/i, // Only contains f, g, h characters
    /^test/i, // Starts with "test"
    /^debug/i, // Starts with "debug"
    /^sample/i, // Starts with "sample"
    /^placeholder/i, // Starts with "placeholder"
  ];

  // Check name for test patterns
  for (const pattern of testPatterns) {
    if (pattern.test(review.name)) {
      return true;
    }
  }

  // Check review content for test patterns
  for (const pattern of testPatterns) {
    if (pattern.test(review.review)) {
      return true;
    }
  }

  // Check for very short or nonsensical content
  if (review.name.length < 2 || review.review.length < 10) {
    return true;
  }

  // Check for repeated characters (like "aaaaaaa" or "1111111")
  if (/^(.)\1{4,}$/.test(review.name) || /^(.)\1{9,}$/.test(review.review)) {
    return true;
  }

  return false;
}

// Function to clean up test reviews
export async function cleanupTestReviews(): Promise<{
  removed: number;
  total: number;
  removedReviews: string[];
}> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      return { removed: 0, total: 0, removedReviews: [] };
    }

    const reviewsData = snapshot.val();
    const reviews = Object.entries(reviewsData).map(([key, value]) => ({
      key,
      ...(value as Review)
    }));

    const testReviews = reviews.filter(review => isTestReview(review));
    const removedReviews: string[] = [];

    // Remove test reviews
    for (const testReview of testReviews) {
      const reviewRef = ref(database, `reviews/${testReview.key}`);
      await remove(reviewRef);
      removedReviews.push(`${testReview.name} - "${testReview.review}"`);
    }

    return {
      removed: testReviews.length,
      total: reviews.length,
      removedReviews
    };
  } catch (error) {
    console.error('Error cleaning up test reviews:', error);
    throw error;
  }
}

// Function to get all reviews for inspection
export async function getAllReviewsForInspection(): Promise<Review[]> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const reviewsData = snapshot.val();
    return Object.values(reviewsData) as Review[];
  } catch (error) {
    console.error('Error getting reviews for inspection:', error);
    throw error;
  }
}

// Function to approve only legitimate reviews
export async function approveOnlyLegitimateReviews(): Promise<{
  approved: number;
  total: number;
  approvedReviews: string[];
}> {
  try {
    const reviewsRef = ref(database, 'reviews');
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) {
      return { approved: 0, total: 0, approvedReviews: [] };
    }

    const reviewsData = snapshot.val();
    const reviews = Object.entries(reviewsData).map(([key, value]) => ({
      key,
      ...(value as Review)
    }));

    const legitimateReviews = reviews.filter(review => !isTestReview(review));
    const approvedReviews: string[] = [];

    // Approve only legitimate reviews
    for (const review of legitimateReviews) {
      if (!review.approved) {
        const reviewRef = ref(database, `reviews/${review.key}`);
        await update(reviewRef, { approved: true });
        approvedReviews.push(`${review.name} - "${review.review}"`);
      }
    }

    return {
      approved: approvedReviews.length,
      total: reviews.length,
      approvedReviews
    };
  } catch (error) {
    console.error('Error approving legitimate reviews:', error);
    throw error;
  }
}
