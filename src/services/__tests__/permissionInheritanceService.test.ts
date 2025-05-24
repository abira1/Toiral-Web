/**
 * Permission Inheritance Service Tests
 * 
 * These tests verify that the permission inheritance engine works correctly
 * as an additive extension without affecting existing functionality.
 * 
 * CRITICAL: These tests ensure that inheritance features work properly while
 * maintaining complete backward compatibility with the existing permission system.
 */

import {
  resolvePermissionInheritance,
  detectCircularDependency,
  validateInheritanceStructure,
  getPermissionChildren,
  getInheritanceTree,
  isInheritanceSystemAvailable,
  getInheritanceSystemStats,
  clearInheritanceCache,
  InheritanceConfig
} from '../permissionInheritanceService';
import { EnhancedPermission } from '../enhancedPermissionsService';

/**
 * Test permission inheritance resolution
 */
export const testPermissionInheritanceResolution = (): { success: boolean; results: any[] } => {
  const results: any[] = [];
  let allTestsPassed = true;

  console.log('🧪 Testing Permission Inheritance Resolution...\n');

  // Test 1: Basic inheritance resolution
  try {
    console.log('🔗 Testing basic inheritance resolution...');
    
    const testPermissions: { [id: string]: EnhancedPermission } = {
      'read-content': {
        id: 'read-content',
        name: 'Read Content',
        category: 'content',
        level: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      'edit-content': {
        id: 'edit-content',
        name: 'Edit Content',
        category: 'content',
        level: 2,
        inheritsFrom: ['read-content'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      'admin-content': {
        id: 'admin-content',
        name: 'Admin Content',
        category: 'content',
        level: 3,
        inheritsFrom: ['edit-content'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    };

    const config: InheritanceConfig = {
      enabled: true,
      maxDepth: 10,
      cacheEnabled: false, // Disable cache for testing
      fallbackToLegacy: true,
      debugMode: false
    };

    const result = resolvePermissionInheritance('admin-content', testPermissions, config);
    
    if (result.resolvedPermissions.includes('read-content') && 
        result.resolvedPermissions.includes('edit-content') && 
        result.resolvedPermissions.includes('admin-content')) {
      console.log('  ✅ Basic inheritance resolution passed');
      results.push({ test: 'Basic Inheritance Resolution', status: 'PASS', result });
    } else {
      console.log('  ❌ Basic inheritance resolution failed:', result);
      results.push({ test: 'Basic Inheritance Resolution', status: 'FAIL', result });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Basic inheritance resolution error:', error);
    results.push({ test: 'Basic Inheritance Resolution', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 2: Circular dependency detection
  try {
    console.log('🔄 Testing circular dependency detection...');
    
    const circularPermissions: { [id: string]: EnhancedPermission } = {
      'perm-a': {
        id: 'perm-a',
        name: 'Permission A',
        category: 'system',
        level: 1,
        inheritsFrom: ['perm-b'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      'perm-b': {
        id: 'perm-b',
        name: 'Permission B',
        category: 'system',
        level: 1,
        inheritsFrom: ['perm-a'], // Circular dependency
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    };

    const circularCheck = detectCircularDependency('perm-a', circularPermissions);
    
    if (circularCheck.hasCircularDependency) {
      console.log('  ✅ Circular dependency detection passed');
      results.push({ test: 'Circular Dependency Detection', status: 'PASS', circularCheck });
    } else {
      console.log('  ❌ Circular dependency detection failed:', circularCheck);
      results.push({ test: 'Circular Dependency Detection', status: 'FAIL', circularCheck });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Circular dependency detection error:', error);
    results.push({ test: 'Circular Dependency Detection', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 3: Inheritance with disabled system
  try {
    console.log('🔒 Testing inheritance with disabled system...');
    
    const testPermissions: { [id: string]: EnhancedPermission } = {
      'test-permission': {
        id: 'test-permission',
        name: 'Test Permission',
        category: 'system',
        level: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    };

    const disabledConfig: InheritanceConfig = {
      enabled: false, // Disabled for safety
      maxDepth: 10,
      cacheEnabled: false,
      fallbackToLegacy: true,
      debugMode: false
    };

    const result = resolvePermissionInheritance('test-permission', testPermissions, disabledConfig);
    
    if (result.fallbackUsed && result.resolvedPermissions.includes('test-permission')) {
      console.log('  ✅ Disabled system fallback passed');
      results.push({ test: 'Disabled System Fallback', status: 'PASS', result });
    } else {
      console.log('  ❌ Disabled system fallback failed:', result);
      results.push({ test: 'Disabled System Fallback', status: 'FAIL', result });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Disabled system fallback error:', error);
    results.push({ test: 'Disabled System Fallback', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 4: Max depth protection
  try {
    console.log('🛡️ Testing max depth protection...');
    
    const deepPermissions: { [id: string]: EnhancedPermission } = {};
    
    // Create a deep inheritance chain
    for (let i = 0; i < 15; i++) {
      deepPermissions[`perm-${i}`] = {
        id: `perm-${i}`,
        name: `Permission ${i}`,
        category: 'system',
        level: i,
        inheritsFrom: i > 0 ? [`perm-${i-1}`] : undefined,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      };
    }

    const shallowConfig: InheritanceConfig = {
      enabled: true,
      maxDepth: 5, // Shallow depth limit
      cacheEnabled: false,
      fallbackToLegacy: true,
      debugMode: false
    };

    const result = resolvePermissionInheritance('perm-14', deepPermissions, shallowConfig);
    
    if (result.fallbackUsed && result.errors.some(e => e.includes('Max inheritance depth'))) {
      console.log('  ✅ Max depth protection passed');
      results.push({ test: 'Max Depth Protection', status: 'PASS', result });
    } else {
      console.log('  ❌ Max depth protection failed:', result);
      results.push({ test: 'Max Depth Protection', status: 'FAIL', result });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Max depth protection error:', error);
    results.push({ test: 'Max Depth Protection', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  return {
    success: allTestsPassed,
    results
  };
};

/**
 * Test inheritance utility functions
 */
export const testInheritanceUtilities = (): { success: boolean; results: any[] } => {
  const results: any[] = [];
  let allTestsPassed = true;

  console.log('\n🔧 Testing Inheritance Utility Functions...\n');

  // Test 1: Permission children detection
  try {
    console.log('👶 Testing permission children detection...');
    
    const testPermissions: { [id: string]: EnhancedPermission } = {
      'parent': {
        id: 'parent',
        name: 'Parent Permission',
        category: 'system',
        level: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      'child1': {
        id: 'child1',
        name: 'Child 1',
        category: 'system',
        level: 2,
        inheritsFrom: ['parent'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      'child2': {
        id: 'child2',
        name: 'Child 2',
        category: 'system',
        level: 2,
        inheritsFrom: ['parent'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    };

    const children = getPermissionChildren('parent', testPermissions);
    
    if (children.includes('child1') && children.includes('child2') && children.length === 2) {
      console.log('  ✅ Permission children detection passed');
      results.push({ test: 'Permission Children Detection', status: 'PASS', children });
    } else {
      console.log('  ❌ Permission children detection failed:', children);
      results.push({ test: 'Permission Children Detection', status: 'FAIL', children });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ Permission children detection error:', error);
    results.push({ test: 'Permission Children Detection', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 2: System availability check
  try {
    console.log('🔍 Testing system availability check...');
    
    const available = isInheritanceSystemAvailable();
    const stats = getInheritanceSystemStats();
    
    if (typeof available === 'boolean' && typeof stats === 'object') {
      console.log('  ✅ System availability check passed');
      console.log('  📊 Inheritance system available:', available);
      console.log('  📈 System stats:', stats);
      results.push({ test: 'System Availability Check', status: 'PASS', available, stats });
    } else {
      console.log('  ❌ System availability check failed');
      results.push({ test: 'System Availability Check', status: 'FAIL' });
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('  ❌ System availability check error:', error);
    results.push({ test: 'System Availability Check', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  // Test 3: Cache management
  try {
    console.log('💾 Testing cache management...');
    
    // Clear cache should not throw errors
    clearInheritanceCache();
    
    console.log('  ✅ Cache management passed');
    results.push({ test: 'Cache Management', status: 'PASS' });
  } catch (error) {
    console.log('  ❌ Cache management error:', error);
    results.push({ test: 'Cache Management', status: 'ERROR', error: error.message });
    allTestsPassed = false;
  }

  return {
    success: allTestsPassed,
    results
  };
};

/**
 * Run all inheritance tests
 */
export const runAllInheritanceTests = (): { success: boolean; results: any } => {
  console.log('🚀 Starting Permission Inheritance Engine Tests...\n');

  const resolutionTests = testPermissionInheritanceResolution();
  const utilityTests = testInheritanceUtilities();

  const allResults = {
    resolution: resolutionTests,
    utilities: utilityTests,
    overall: resolutionTests.success && utilityTests.success
  };

  console.log('\n🏁 Permission Inheritance Engine Tests Complete!');
  console.log(`Overall Success: ${allResults.overall ? '✅ PASS' : '❌ FAIL'}`);

  return {
    success: allResults.overall,
    results: allResults
  };
};
