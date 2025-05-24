/**
 * Validation Integration Test
 * 
 * This file provides a simple test to verify that the validation system
 * works correctly and doesn't break existing functionality.
 * 
 * Run this test to ensure the validation layer is working properly.
 */

import {
  validatePortfolioItem,
  validateReview,
  validateBookingSubmission,
  validateContactFormSubmission,
  validateBeforeOperation
} from './databaseValidationService';

import {
  validateDataOnly,
  getValidationStats
} from './validatedDatabaseService';

/**
 * Test data that matches existing application data structures
 */
const testData = {
  portfolioItem: {
    id: 'test-portfolio-1',
    title: 'Test Project',
    description: 'A comprehensive test project showcasing our capabilities',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300',
    url: 'https://example.com/test-project',
    order: 1
  },
  
  review: {
    id: 'test-review-1',
    name: 'John Doe',
    rating: 5,
    review: 'Excellent service! Highly recommended for anyone looking for quality work.',
    date: new Date().toISOString(),
    approved: true,
    featured: false,
    company: 'Test Company',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100'
  },
  
  bookingSubmission: {
    id: 'test-booking-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-123-4567',
    serviceType: 'Web Development Consultation',
    date: '2024-12-31',
    time: '14:30',
    description: 'I need help with developing a new website for my business. Looking for modern design and responsive layout.',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    userId: 'test-user-123'
  },
  
  contactFormSubmission: {
    id: 'test-contact-1',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    subject: 'Inquiry about services',
    message: 'Hello, I am interested in learning more about your web development services. Could you please provide more information about your pricing and timeline?',
    status: 'new',
    submittedAt: new Date().toISOString(),
    userId: 'test-user-456',
    userPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100'
  }
};

/**
 * Run validation tests
 */
export const runValidationTests = async (): Promise<{ success: boolean; results: any[] }> => {
  const results: any[] = [];
  let allTestsPassed = true;

  console.log('🧪 Starting Validation Integration Tests...\n');

  // Test 1: Portfolio Item Validation
  try {
    console.log('📁 Testing Portfolio Item Validation...');
    const portfolioResult = validatePortfolioItem(testData.portfolioItem);
    
    if (portfolioResult.valid) {
      console.log('  ✅ Portfolio item validation passed');
      results.push({ test: 'Portfolio Item', status: 'PASS', data: portfolioResult });
    } else {
      console.log('  ❌ Portfolio item validation failed:', portfolioResult.errors);
      results.push({ test: 'Portfolio Item', status: 'FAIL', errors: portfolioResult.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Portfolio item validation error:', error);
    results.push({ test: 'Portfolio Item', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 2: Review Validation
  try {
    console.log('⭐ Testing Review Validation...');
    const reviewResult = validateReview(testData.review);
    
    if (reviewResult.valid) {
      console.log('  ✅ Review validation passed');
      results.push({ test: 'Review', status: 'PASS', data: reviewResult });
    } else {
      console.log('  ❌ Review validation failed:', reviewResult.errors);
      results.push({ test: 'Review', status: 'FAIL', errors: reviewResult.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Review validation error:', error);
    results.push({ test: 'Review', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 3: Booking Submission Validation
  try {
    console.log('📅 Testing Booking Submission Validation...');
    const bookingResult = validateBookingSubmission(testData.bookingSubmission);
    
    if (bookingResult.valid) {
      console.log('  ✅ Booking submission validation passed');
      results.push({ test: 'Booking Submission', status: 'PASS', data: bookingResult });
    } else {
      console.log('  ❌ Booking submission validation failed:', bookingResult.errors);
      results.push({ test: 'Booking Submission', status: 'FAIL', errors: bookingResult.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Booking submission validation error:', error);
    results.push({ test: 'Booking Submission', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 4: Contact Form Submission Validation
  try {
    console.log('📧 Testing Contact Form Submission Validation...');
    const contactResult = validateContactFormSubmission(testData.contactFormSubmission);
    
    if (contactResult.valid) {
      console.log('  ✅ Contact form submission validation passed');
      results.push({ test: 'Contact Form Submission', status: 'PASS', data: contactResult });
    } else {
      console.log('  ❌ Contact form submission validation failed:', contactResult.errors);
      results.push({ test: 'Contact Form Submission', status: 'FAIL', errors: contactResult.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Contact form submission validation error:', error);
    results.push({ test: 'Contact Form Submission', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 5: Validation Middleware
  try {
    console.log('⚙️ Testing Validation Middleware...');
    const middlewareResult = await validateBeforeOperation(
      testData.portfolioItem,
      'portfolioItem',
      'create',
      { strict: false, sanitize: true, allowExtraFields: true }
    );
    
    if (middlewareResult.success) {
      console.log('  ✅ Validation middleware test passed');
      results.push({ test: 'Validation Middleware', status: 'PASS', data: middlewareResult });
    } else {
      console.log('  ❌ Validation middleware test failed:', middlewareResult.errors);
      results.push({ test: 'Validation Middleware', status: 'FAIL', errors: middlewareResult.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Validation middleware error:', error);
    results.push({ test: 'Validation Middleware', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 6: Validation Service Integration
  try {
    console.log('🔗 Testing Validation Service Integration...');
    const integrationResult = await validateDataOnly(
      testData.review,
      'review',
      { strict: false }
    );
    
    if (integrationResult.success) {
      console.log('  ✅ Validation service integration test passed');
      results.push({ test: 'Service Integration', status: 'PASS', data: integrationResult });
    } else {
      console.log('  ❌ Validation service integration test failed:', integrationResult.errors);
      results.push({ test: 'Service Integration', status: 'FAIL', errors: integrationResult.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Validation service integration error:', error);
    results.push({ test: 'Service Integration', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 7: Validation Stats
  try {
    console.log('📊 Testing Validation Stats...');
    const stats = getValidationStats();
    
    if (stats && typeof stats === 'object') {
      console.log('  ✅ Validation stats test passed');
      console.log('  📈 Current validation configuration:', stats);
      results.push({ test: 'Validation Stats', status: 'PASS', data: stats });
    } else {
      console.log('  ❌ Validation stats test failed');
      results.push({ test: 'Validation Stats', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Validation stats error:', error);
    results.push({ test: 'Validation Stats', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Summary
  console.log('\n📋 Test Summary:');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log(`Errors: ${results.filter(r => r.status === 'ERROR').length}`);

  if (allTestsPassed) {
    console.log('\n🎉 All validation tests passed! The validation system is working correctly.');
  } else {
    console.log('\n⚠️ Some validation tests failed. Please review the results above.');
  }

  return {
    success: allTestsPassed,
    results
  };
};

/**
 * Test invalid data to ensure validation catches errors
 */
export const runInvalidDataTests = async (): Promise<{ success: boolean; results: any[] }> => {
  const results: any[] = [];
  let allTestsPassed = true;

  console.log('\n🚨 Testing Invalid Data Validation...\n');

  // Test invalid portfolio item
  const invalidPortfolioItem = {
    id: '', // Empty ID should fail
    title: '', // Empty title should fail
    description: 'Valid description',
    image: 'invalid-url', // Invalid URL should fail
    url: 'https://example.com'
  };

  try {
    const result = validatePortfolioItem(invalidPortfolioItem);
    if (!result.valid && Object.keys(result.errors).length > 0) {
      console.log('  ✅ Invalid portfolio item correctly rejected');
      results.push({ test: 'Invalid Portfolio Item', status: 'PASS', errors: result.errors });
    } else {
      console.log('  ❌ Invalid portfolio item was incorrectly accepted');
      results.push({ test: 'Invalid Portfolio Item', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Error testing invalid portfolio item:', error);
    results.push({ test: 'Invalid Portfolio Item', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  return {
    success: allTestsPassed,
    results
  };
};

// Export test data for use in other tests
export { testData };
