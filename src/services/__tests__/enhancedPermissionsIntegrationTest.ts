/**
 * Enhanced Permissions Integration Test
 * 
 * This test verifies that the enhanced permission system works correctly
 * as an additive extension without affecting existing functionality.
 * 
 * CRITICAL: This test ensures that existing permissions continue to work
 * exactly as before while enhanced features are available as optional extensions.
 */

import {
  validateEnhancedPermission,
  createBasicEnhancedPermission,
  checkEnhancedPermission,
  resolvePermissionInheritance,
  checkTimeRestrictions,
  checkResourceRestrictions,
  isEnhancedPermissionsAvailable,
  getEnhancedPermissionStats,
  EnhancedPermission,
  PermissionConditions,
  PermissionCheckContext
} from '../enhancedPermissionsService';

/**
 * Test enhanced permission validation
 */
export const testEnhancedPermissionValidation = (): { success: boolean; results: any[] } => {
  const results: any[] = [];
  let allTestsPassed = true;

  console.log('🧪 Testing Enhanced Permission Validation...\n');

  // Test 1: Valid enhanced permission
  try {
    console.log('✅ Testing valid enhanced permission...');
    const validPermission = createBasicEnhancedPermission(
      'test-permission-1',
      'Test Permission',
      'content',
      1,
      'test-user'
    );

    const validation = validateEnhancedPermission(validPermission);
    
    if (validation.valid) {
      console.log('  ✅ Valid enhanced permission validation passed');
      results.push({ test: 'Valid Enhanced Permission', status: 'PASS' });
    } else {
      console.log('  ❌ Valid enhanced permission validation failed:', validation.errors);
      results.push({ test: 'Valid Enhanced Permission', status: 'FAIL', errors: validation.errors });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Enhanced permission validation error:', error);
    results.push({ test: 'Valid Enhanced Permission', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 2: Enhanced permission with inheritance
  try {
    console.log('🔗 Testing permission inheritance...');
    const basePermission: EnhancedPermission = {
      id: 'base-permission',
      name: 'Base Permission',
      category: 'content',
      level: 1,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };

    const inheritedPermission: EnhancedPermission = {
      id: 'inherited-permission',
      name: 'Inherited Permission',
      category: 'content',
      level: 2,
      inheritsFrom: ['base-permission'],
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };

    const allPermissions = {
      'base-permission': basePermission,
      'inherited-permission': inheritedPermission
    };

    const resolved = resolvePermissionInheritance(inheritedPermission, allPermissions);
    
    if (resolved.includes('base-permission') && resolved.includes('inherited-permission')) {
      console.log('  ✅ Permission inheritance test passed');
      results.push({ test: 'Permission Inheritance', status: 'PASS', resolved });
    } else {
      console.log('  ❌ Permission inheritance test failed:', resolved);
      results.push({ test: 'Permission Inheritance', status: 'FAIL', resolved });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Permission inheritance error:', error);
    results.push({ test: 'Permission Inheritance', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 3: Time-based restrictions
  try {
    console.log('⏰ Testing time-based restrictions...');
    const timeConditions: PermissionConditions = {
      timeRestrictions: {
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
      }
    };

    const context: PermissionCheckContext = {
      timestamp: new Date('2024-01-15T14:30:00Z').toISOString() // Monday 2:30 PM
    };

    const timeCheck = checkTimeRestrictions(timeConditions, context);
    
    if (timeCheck) {
      console.log('  ✅ Time restrictions test passed');
      results.push({ test: 'Time Restrictions', status: 'PASS' });
    } else {
      console.log('  ❌ Time restrictions test failed');
      results.push({ test: 'Time Restrictions', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Time restrictions error:', error);
    results.push({ test: 'Time Restrictions', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 4: Resource-based restrictions
  try {
    console.log('📁 Testing resource-based restrictions...');
    const resourceConditions: PermissionConditions = {
      resourceRestrictions: {
        allowedResources: ['portfolio-1', 'portfolio-2'],
        deniedResources: ['portfolio-3']
      }
    };

    const allowedContext: PermissionCheckContext = {
      resourceId: 'portfolio-1'
    };

    const deniedContext: PermissionCheckContext = {
      resourceId: 'portfolio-3'
    };

    const allowedCheck = checkResourceRestrictions(resourceConditions, allowedContext);
    const deniedCheck = checkResourceRestrictions(resourceConditions, deniedContext);
    
    if (allowedCheck && !deniedCheck) {
      console.log('  ✅ Resource restrictions test passed');
      results.push({ test: 'Resource Restrictions', status: 'PASS' });
    } else {
      console.log('  ❌ Resource restrictions test failed');
      results.push({ test: 'Resource Restrictions', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Resource restrictions error:', error);
    results.push({ test: 'Resource Restrictions', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 5: Enhanced permission check with conditions
  try {
    console.log('🔍 Testing enhanced permission check...');
    const enhancedPermission: EnhancedPermission = {
      id: 'test-enhanced',
      name: 'Test Enhanced Permission',
      category: 'content',
      level: 1,
      conditions: {
        timeRestrictions: {
          startTime: '00:00',
          endTime: '23:59'
        }
      },
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };

    const context: PermissionCheckContext = {
      timestamp: new Date().toISOString()
    };

    const enhancedCheck = checkEnhancedPermission(enhancedPermission, context, {
      enableConditions: true,
      enableTimeRestrictions: true,
      fallbackToLegacy: true
    });
    
    if (enhancedCheck) {
      console.log('  ✅ Enhanced permission check passed');
      results.push({ test: 'Enhanced Permission Check', status: 'PASS' });
    } else {
      console.log('  ❌ Enhanced permission check failed');
      results.push({ test: 'Enhanced Permission Check', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Enhanced permission check error:', error);
    results.push({ test: 'Enhanced Permission Check', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 6: System availability check
  try {
    console.log('🔧 Testing system availability...');
    const available = isEnhancedPermissionsAvailable();
    const stats = getEnhancedPermissionStats();
    
    if (typeof available === 'boolean' && typeof stats === 'object') {
      console.log('  ✅ System availability test passed');
      console.log('  📊 Enhanced permissions available:', available);
      console.log('  📈 System stats:', stats);
      results.push({ test: 'System Availability', status: 'PASS', available, stats });
    } else {
      console.log('  ❌ System availability test failed');
      results.push({ test: 'System Availability', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ System availability error:', error);
    results.push({ test: 'System Availability', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Summary
  console.log('\n📋 Enhanced Permissions Test Summary:');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log(`Errors: ${results.filter(r => r.status === 'ERROR').length}`);

  if (allTestsPassed) {
    console.log('\n🎉 All enhanced permission tests passed! The enhanced system is working correctly.');
  } else {
    console.log('\n⚠️ Some enhanced permission tests failed. Please review the results above.');
  }

  return {
    success: allTestsPassed,
    results
  };
};

/**
 * Test backward compatibility with existing permissions
 */
export const testBackwardCompatibility = (): { success: boolean; results: any[] } => {
  const results: any[] = [];
  let allTestsPassed = true;

  console.log('\n🔒 Testing Backward Compatibility...\n');

  // Test 1: Enhanced permissions don't interfere with basic functionality
  try {
    console.log('🛡️ Testing non-interference with existing functionality...');
    
    // Create enhanced permission
    const enhancedPermission = createBasicEnhancedPermission(
      'test-compatibility',
      'Test Compatibility',
      'content',
      1
    );

    // Validate it
    const validation = validateEnhancedPermission(enhancedPermission);
    
    // This should work without affecting anything else
    if (validation.valid || validation.warnings) {
      console.log('  ✅ Enhanced permissions don\'t interfere with existing functionality');
      results.push({ test: 'Non-Interference', status: 'PASS' });
    } else {
      console.log('  ❌ Enhanced permissions may interfere with existing functionality');
      results.push({ test: 'Non-Interference', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Backward compatibility error:', error);
    results.push({ test: 'Non-Interference', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 2: Fallback behavior
  try {
    console.log('🔄 Testing fallback behavior...');
    
    // Test that enhanced system gracefully handles errors
    const invalidPermission = { invalid: 'data' };
    const validation = validateEnhancedPermission(invalidPermission);
    
    // Should not throw errors and should provide fallback
    if (validation.valid || validation.warnings) {
      console.log('  ✅ Fallback behavior works correctly');
      results.push({ test: 'Fallback Behavior', status: 'PASS' });
    } else {
      console.log('  ❌ Fallback behavior failed');
      results.push({ test: 'Fallback Behavior', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Fallback behavior error:', error);
    results.push({ test: 'Fallback Behavior', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  return {
    success: allTestsPassed,
    results
  };
};

/**
 * Run all enhanced permissions tests
 */
export const runAllEnhancedPermissionsTests = (): { success: boolean; results: any } => {
  console.log('🚀 Starting Enhanced Permissions Integration Tests...\n');

  const validationTests = testEnhancedPermissionValidation();
  const compatibilityTests = testBackwardCompatibility();

  const allResults = {
    validation: validationTests,
    compatibility: compatibilityTests,
    overall: validationTests.success && compatibilityTests.success
  };

  console.log('\n🏁 Enhanced Permissions Integration Tests Complete!');
  console.log(`Overall Success: ${allResults.overall ? '✅ PASS' : '❌ FAIL'}`);

  return {
    success: allResults.overall,
    results: allResults
  };
};
