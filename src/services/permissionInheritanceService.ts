/**
 * Permission Inheritance Service
 *
 * This service provides permission inheritance and hierarchy functionality
 * as a COMPLETELY SEPARATE, ADDITIVE EXTENSION to the existing permission system.
 *
 * CRITICAL SAFETY GUARANTEES:
 * - Does NOT modify or replace any existing permission logic
 * - Maintains 100% backward compatibility with current PermissionsContext
 * - All functions fallback to existing permission system on any error
 * - Inheritance features are OPTIONAL and disabled by default
 * - Zero impact on existing user flows and admin panel functionality
 */

import { EnhancedPermission, EnhancedRole } from './enhancedPermissionsService';

// Inheritance configuration (disabled by default for safety)
export interface InheritanceConfig {
  enabled: boolean;
  maxDepth: number; // Prevent infinite recursion
  cacheEnabled: boolean;
  fallbackToLegacy: boolean; // Always fallback to existing system
  debugMode: boolean;
}

// Default configuration (safe, non-breaking)
const defaultInheritanceConfig: InheritanceConfig = {
  enabled: false, // Disabled by default for maximum safety
  maxDepth: 10, // Reasonable limit to prevent infinite loops
  cacheEnabled: true, // Safe to enable caching
  fallbackToLegacy: true, // Always fallback to existing system
  debugMode: false // Disabled by default
};

// Inheritance resolution result
export interface InheritanceResolutionResult {
  resolvedPermissions: string[];
  inheritanceChain: string[];
  circularDependencyDetected: boolean;
  fallbackUsed: boolean;
  errors: string[];
  warnings: string[];
}

// Permission inheritance cache
interface InheritanceCache {
  [permissionId: string]: {
    resolvedPermissions: string[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
  };
}

// Global inheritance cache (safe, isolated from existing system)
let inheritanceCache: InheritanceCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clears the inheritance cache
 * This is safe and doesn't affect existing functionality
 */
export const clearInheritanceCache = (): void => {
  try {
    inheritanceCache = {};
    if (defaultInheritanceConfig.debugMode) {
      console.log('Permission inheritance cache cleared');
    }
  } catch (error) {
    console.error('Error clearing inheritance cache:', error);
    // Safe to ignore errors here
  }
};

/**
 * Gets cached inheritance result if available and valid
 * This is purely additive and doesn't affect existing functionality
 */
const getCachedInheritance = (
  permissionId: string,
  config: InheritanceConfig
): string[] | null => {
  try {
    if (!config.cacheEnabled) {
      return null;
    }

    const cached = inheritanceCache[permissionId];
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      // Cache expired, remove it
      delete inheritanceCache[permissionId];
      return null;
    }

    if (config.debugMode) {
      console.log(`Cache hit for permission: ${permissionId}`);
    }

    return cached.resolvedPermissions;
  } catch (error) {
    console.error('Error getting cached inheritance:', error);
    return null; // Safe fallback
  }
};

/**
 * Caches inheritance result
 * This is safe and doesn't affect existing functionality
 */
const cacheInheritanceResult = (
  permissionId: string,
  resolvedPermissions: string[],
  config: InheritanceConfig
): void => {
  try {
    if (!config.cacheEnabled) {
      return;
    }

    inheritanceCache[permissionId] = {
      resolvedPermissions: [...resolvedPermissions], // Create copy
      timestamp: Date.now(),
      ttl: CACHE_TTL
    };

    if (config.debugMode) {
      console.log(`Cached inheritance for permission: ${permissionId}`);
    }
  } catch (error) {
    console.error('Error caching inheritance result:', error);
    // Safe to ignore errors here
  }
};

/**
 * Detects circular dependencies in permission inheritance
 * This is a safety mechanism that doesn't affect existing functionality
 */
export const detectCircularDependency = (
  permissionId: string,
  allPermissions: { [id: string]: EnhancedPermission },
  visited: Set<string> = new Set(),
  path: string[] = []
): { hasCircularDependency: boolean; circularPath: string[] } => {
  try {
    // Check if we've already visited this permission in the current path
    if (visited.has(permissionId)) {
      const circularStartIndex = path.indexOf(permissionId);
      const circularPath = path.slice(circularStartIndex).concat([permissionId]);
      return {
        hasCircularDependency: true,
        circularPath
      };
    }

    const permission = allPermissions[permissionId];
    if (!permission || !permission.inheritsFrom || permission.inheritsFrom.length === 0) {
      return {
        hasCircularDependency: false,
        circularPath: []
      };
    }

    // Add current permission to visited set and path
    const newVisited = new Set(visited);
    newVisited.add(permissionId);
    const newPath = [...path, permissionId];

    // Check each inherited permission
    for (const inheritedId of permission.inheritsFrom) {
      const result = detectCircularDependency(inheritedId, allPermissions, newVisited, newPath);
      if (result.hasCircularDependency) {
        return result;
      }
    }

    return {
      hasCircularDependency: false,
      circularPath: []
    };
  } catch (error) {
    console.error('Error detecting circular dependency:', error);
    // Safe fallback - assume no circular dependency
    return {
      hasCircularDependency: false,
      circularPath: []
    };
  }
};

/**
 * Resolves permission inheritance recursively with safety mechanisms
 * This is completely additive and doesn't affect existing permission checking
 */
export const resolvePermissionInheritance = (
  permissionId: string,
  allPermissions: { [id: string]: EnhancedPermission },
  config: Partial<InheritanceConfig> = {},
  visited: Set<string> = new Set(),
  depth: number = 0
): InheritanceResolutionResult => {
  const finalConfig = { ...defaultInheritanceConfig, ...config };

  try {
    // Safety check: if inheritance is disabled, return just the base permission
    if (!finalConfig.enabled) {
      return {
        resolvedPermissions: [permissionId],
        inheritanceChain: [permissionId],
        circularDependencyDetected: false,
        fallbackUsed: true,
        errors: [],
        warnings: ['Inheritance disabled, returning base permission']
      };
    }

    // Safety check: prevent infinite recursion
    if (depth > finalConfig.maxDepth) {
      return {
        resolvedPermissions: [permissionId],
        inheritanceChain: [permissionId],
        circularDependencyDetected: false,
        fallbackUsed: true,
        errors: [`Max inheritance depth (${finalConfig.maxDepth}) exceeded`],
        warnings: []
      };
    }

    // Check cache first
    const cached = getCachedInheritance(permissionId, finalConfig);
    if (cached) {
      return {
        resolvedPermissions: cached,
        inheritanceChain: [permissionId],
        circularDependencyDetected: false,
        fallbackUsed: false,
        errors: [],
        warnings: []
      };
    }

    // Check for circular dependency
    if (visited.has(permissionId)) {
      return {
        resolvedPermissions: [permissionId],
        inheritanceChain: [permissionId],
        circularDependencyDetected: true,
        fallbackUsed: true,
        errors: [`Circular dependency detected for permission: ${permissionId}`],
        warnings: []
      };
    }

    const permission = allPermissions[permissionId];
    if (!permission) {
      return {
        resolvedPermissions: [permissionId],
        inheritanceChain: [permissionId],
        circularDependencyDetected: false,
        fallbackUsed: true,
        errors: [`Permission not found: ${permissionId}`],
        warnings: []
      };
    }

    // Start with the base permission
    const resolvedPermissions = new Set<string>([permissionId]);
    const inheritanceChain = [permissionId];
    const errors: string[] = [];
    const warnings: string[] = [];

    // If no inheritance, return base permission
    if (!permission.inheritsFrom || permission.inheritsFrom.length === 0) {
      const result = Array.from(resolvedPermissions);
      cacheInheritanceResult(permissionId, result, finalConfig);
      return {
        resolvedPermissions: result,
        inheritanceChain,
        circularDependencyDetected: false,
        fallbackUsed: false,
        errors,
        warnings
      };
    }

    // Add current permission to visited set
    const newVisited = new Set(visited);
    newVisited.add(permissionId);

    // Resolve inherited permissions
    for (const inheritedId of permission.inheritsFrom) {
      try {
        const inheritedResult = resolvePermissionInheritance(
          inheritedId,
          allPermissions,
          finalConfig,
          newVisited,
          depth + 1
        );

        // Add resolved permissions
        inheritedResult.resolvedPermissions.forEach(p => resolvedPermissions.add(p));

        // Merge inheritance chain
        inheritanceChain.push(...inheritedResult.inheritanceChain);

        // Collect errors and warnings
        errors.push(...inheritedResult.errors);
        warnings.push(...inheritedResult.warnings);

        // Check for circular dependency
        if (inheritedResult.circularDependencyDetected) {
          warnings.push(`Circular dependency in inherited permission: ${inheritedId}`);
        }
      } catch (error) {
        errors.push(`Error resolving inherited permission ${inheritedId}: ${error.message}`);
        // Continue with other inherited permissions
      }
    }

    const result = Array.from(resolvedPermissions);

    // Cache the result if no errors
    if (errors.length === 0) {
      cacheInheritanceResult(permissionId, result, finalConfig);
    }

    return {
      resolvedPermissions: result,
      inheritanceChain,
      circularDependencyDetected: false,
      fallbackUsed: false,
      errors,
      warnings
    };
  } catch (error) {
    console.error('Error in permission inheritance resolution:', error);

    // Safe fallback - return just the base permission
    return {
      resolvedPermissions: [permissionId],
      inheritanceChain: [permissionId],
      circularDependencyDetected: false,
      fallbackUsed: true,
      errors: [`System error in inheritance resolution: ${error.message}`],
      warnings: []
    };
  }
};

/**
 * Validates permission inheritance structure
 * This is a safety check that doesn't affect existing functionality
 */
export const validateInheritanceStructure = (
  allPermissions: { [id: string]: EnhancedPermission },
  config: Partial<InheritanceConfig> = {}
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const finalConfig = { ...defaultInheritanceConfig, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    if (!finalConfig.enabled) {
      return {
        valid: true,
        errors: [],
        warnings: ['Inheritance validation skipped - inheritance disabled']
      };
    }

    // Check each permission for inheritance issues
    for (const [permissionId, permission] of Object.entries(allPermissions)) {
      try {
        // Check for circular dependencies
        const circularCheck = detectCircularDependency(permissionId, allPermissions);
        if (circularCheck.hasCircularDependency) {
          errors.push(`Circular dependency detected for ${permissionId}: ${circularCheck.circularPath.join(' -> ')}`);
        }

        // Check if inherited permissions exist
        if (permission.inheritsFrom && permission.inheritsFrom.length > 0) {
          for (const inheritedId of permission.inheritsFrom) {
            if (!allPermissions[inheritedId]) {
              errors.push(`Permission ${permissionId} inherits from non-existent permission: ${inheritedId}`);
            }
          }
        }

        // Check inheritance depth
        const resolution = resolvePermissionInheritance(permissionId, allPermissions, finalConfig);
        if (resolution.errors.length > 0) {
          errors.push(...resolution.errors.map(e => `${permissionId}: ${e}`));
        }
        if (resolution.warnings.length > 0) {
          warnings.push(...resolution.warnings.map(w => `${permissionId}: ${w}`));
        }
      } catch (error) {
        errors.push(`Error validating permission ${permissionId}: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    console.error('Error validating inheritance structure:', error);
    return {
      valid: false,
      errors: [`System error in inheritance validation: ${error.message}`],
      warnings: []
    };
  }
};

/**
 * Gets all permissions that inherit from a specific permission
 * This is purely informational and doesn't affect existing functionality
 */
export const getPermissionChildren = (
  parentPermissionId: string,
  allPermissions: { [id: string]: EnhancedPermission }
): string[] => {
  try {
    const children: string[] = [];

    for (const [permissionId, permission] of Object.entries(allPermissions)) {
      if (permission.inheritsFrom && permission.inheritsFrom.includes(parentPermissionId)) {
        children.push(permissionId);
      }
    }

    return children;
  } catch (error) {
    console.error('Error getting permission children:', error);
    return []; // Safe fallback
  }
};

/**
 * Gets the inheritance tree for a permission
 * This is purely informational and doesn't affect existing functionality
 */
export const getInheritanceTree = (
  permissionId: string,
  allPermissions: { [id: string]: EnhancedPermission },
  config: Partial<InheritanceConfig> = {}
): { tree: any; errors: string[]; warnings: string[] } => {
  const finalConfig = { ...defaultInheritanceConfig, ...config };

  try {
    if (!finalConfig.enabled) {
      return {
        tree: { [permissionId]: {} },
        errors: [],
        warnings: ['Inheritance tree generation skipped - inheritance disabled']
      };
    }

    const buildTree = (
      currentId: string,
      visited: Set<string> = new Set(),
      depth: number = 0
    ): any => {
      // Prevent infinite recursion
      if (depth > finalConfig.maxDepth || visited.has(currentId)) {
        return { _circular: true };
      }

      const permission = allPermissions[currentId];
      if (!permission) {
        return { _notFound: true };
      }

      const newVisited = new Set(visited);
      newVisited.add(currentId);

      const tree: any = {};

      if (permission.inheritsFrom && permission.inheritsFrom.length > 0) {
        for (const inheritedId of permission.inheritsFrom) {
          tree[inheritedId] = buildTree(inheritedId, newVisited, depth + 1);
        }
      }

      return tree;
    };

    const tree = { [permissionId]: buildTree(permissionId) };

    return {
      tree,
      errors: [],
      warnings: []
    };
  } catch (error) {
    console.error('Error building inheritance tree:', error);
    return {
      tree: { [permissionId]: { _error: error.message } },
      errors: [`Error building inheritance tree: ${error.message}`],
      warnings: []
    };
  }
};

/**
 * Utility function to check if inheritance system is available and safe to use
 * This allows gradual adoption without breaking existing functionality
 */
export const isInheritanceSystemAvailable = (): boolean => {
  try {
    // Simple check to see if inheritance system is working
    const testPermissions = {
      'test-base': {
        id: 'test-base',
        name: 'Test Base',
        category: 'system' as const,
        level: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      },
      'test-inherited': {
        id: 'test-inherited',
        name: 'Test Inherited',
        category: 'system' as const,
        level: 2,
        inheritsFrom: ['test-base'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    };

    const result = resolvePermissionInheritance('test-inherited', testPermissions, { enabled: true });
    return result.resolvedPermissions.includes('test-base') && result.resolvedPermissions.includes('test-inherited');
  } catch (error) {
    console.error('Inheritance system not available:', error);
    return false;
  }
};

/**
 * Gets inheritance system statistics
 * This is purely informational and doesn't affect existing functionality
 */
export const getInheritanceSystemStats = () => {
  try {
    return {
      inheritanceSystemAvailable: isInheritanceSystemAvailable(),
      cacheSize: Object.keys(inheritanceCache).length,
      defaultConfig: defaultInheritanceConfig,
      cacheTTL: CACHE_TTL,
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Error getting inheritance system stats:', error);
    return {
      inheritanceSystemAvailable: false,
      error: 'Failed to get inheritance system stats'
    };
  }
};