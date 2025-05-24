/**
 * Tests for Database Validation Service
 * 
 * These tests ensure that the validation system works correctly
 * and maintains backward compatibility with existing data.
 */

import {
  validatePortfolioItem,
  validateReview,
  validateBookingSubmission,
  validateContactFormSubmission,
  validateUserProfile,
  validateBeforeOperation,
  ValidationOptions
} from '../databaseValidationService';

describe('Database Validation Service', () => {
  describe('Portfolio Item Validation', () => {
    it('should validate a correct portfolio item', () => {
      const validPortfolioItem = {
        id: 'portfolio-1',
        title: 'Test Project',
        description: 'A test project description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/project',
        order: 1
      };

      const result = validatePortfolioItem(validPortfolioItem);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should handle missing optional fields', () => {
      const portfolioItemWithoutOrder = {
        id: 'portfolio-1',
        title: 'Test Project',
        description: 'A test project description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/project'
      };

      const result = validatePortfolioItem(portfolioItemWithoutOrder);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const invalidPortfolioItem = {
        id: 'portfolio-1',
        title: '', // Empty title should fail
        description: 'A test project description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/project'
      };

      const result = validatePortfolioItem(invalidPortfolioItem);
      expect(result.valid).toBe(false);
      expect(result.errors.title).toBeDefined();
    });
  });

  describe('Review Validation', () => {
    it('should validate a correct review', () => {
      const validReview = {
        id: 'review-1',
        name: 'John Doe',
        rating: 5,
        review: 'Great service!',
        date: new Date().toISOString(),
        approved: true,
        featured: false
      };

      const result = validateReview(validReview);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for invalid rating', () => {
      const invalidReview = {
        id: 'review-1',
        name: 'John Doe',
        rating: 6, // Rating should be 1-5
        review: 'Great service!',
        date: new Date().toISOString(),
        approved: true
      };

      const result = validateReview(invalidReview);
      expect(result.valid).toBe(false);
      expect(result.errors.rating).toBeDefined();
    });
  });

  describe('Booking Submission Validation', () => {
    it('should validate a correct booking submission', () => {
      const validBooking = {
        id: 'booking-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        serviceType: 'Consultation',
        date: '2024-12-31',
        time: '14:30',
        description: 'Need help with my project',
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      const result = validateBookingSubmission(validBooking);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for invalid email', () => {
      const invalidBooking = {
        id: 'booking-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email', // Invalid email format
        phone: '+1234567890',
        serviceType: 'Consultation',
        date: '2024-12-31',
        time: '14:30',
        description: 'Need help with my project',
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      const result = validateBookingSubmission(invalidBooking);
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });
  });

  describe('Validation Options', () => {
    it('should allow operations to proceed in non-strict mode even with errors', async () => {
      const invalidData = {
        id: 'test-1',
        title: '', // This should fail validation
        description: 'Test description',
        image: 'invalid-url', // This should also fail
        url: 'https://example.com'
      };

      const options: ValidationOptions = {
        strict: false,
        sanitize: true,
        allowExtraFields: true,
        skipValidation: false
      };

      const result = await validateBeforeOperation(
        invalidData,
        'portfolioItem',
        'create',
        options
      );

      expect(result.success).toBe(true); // Should succeed in non-strict mode
    });

    it('should prevent operations in strict mode with errors', async () => {
      const invalidData = {
        id: 'test-1',
        title: '', // This should fail validation
        description: 'Test description',
        image: 'invalid-url',
        url: 'https://example.com'
      };

      const options: ValidationOptions = {
        strict: true,
        sanitize: true,
        allowExtraFields: true,
        skipValidation: false
      };

      const result = await validateBeforeOperation(
        invalidData,
        'portfolioItem',
        'create',
        options
      );

      expect(result.success).toBe(false); // Should fail in strict mode
      expect(result.errors).toBeDefined();
    });

    it('should skip validation when requested', async () => {
      const invalidData = {
        id: 'test-1',
        title: '', // This would normally fail
        description: 'Test description'
      };

      const options: ValidationOptions = {
        strict: true,
        sanitize: true,
        allowExtraFields: true,
        skipValidation: true // Skip validation entirely
      };

      const result = await validateBeforeOperation(
        invalidData,
        'portfolioItem',
        'create',
        options
      );

      expect(result.success).toBe(true); // Should succeed when validation is skipped
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize data when requested', () => {
      const dataWithExtraFields = {
        id: 'portfolio-1',
        title: 'Test Project',
        description: 'A test project description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/project',
        extraField: 'This should be preserved',
        anotherExtra: 123
      };

      const options: ValidationOptions = {
        strict: false,
        sanitize: true,
        allowExtraFields: true,
        skipValidation: false
      };

      const result = validatePortfolioItem(dataWithExtraFields, options);
      expect(result.valid).toBe(true);
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData.extraField).toBe('This should be preserved');
    });
  });
});

// Mock Jest functions if not available
if (typeof describe === 'undefined') {
  global.describe = (name: string, fn: () => void) => {
    console.log(`Test Suite: ${name}`);
    fn();
  };
}

if (typeof it === 'undefined') {
  global.it = (name: string, fn: () => void) => {
    console.log(`  Test: ${name}`);
    try {
      fn();
      console.log(`    ✓ Passed`);
    } catch (error) {
      console.log(`    ✗ Failed: ${error}`);
    }
  };
}

if (typeof expect === 'undefined') {
  global.expect = (actual: any) => ({
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error(`Expected ${actual} to be defined`);
      }
    },
    toHaveLength: (length: number) => {
      if (actual.length !== length) {
        throw new Error(`Expected ${actual} to have length ${length}`);
      }
    }
  });
}
