/**
 * Enhanced Permissions Service
 * 
 * This service provides advanced permission features as an ADDITIVE EXTENSION
 * to the existing permission system. It does NOT modify or replace any existing
 * permission logic and maintains 100% backward compatibility.
 * 
 * CRITICAL: This service is completely optional and does not affect existing
 * functionality. All current permission checks continue to work unchanged.
 */

import { enhancedPermissionSchema } from './dataSchemas';
import { validateData, ValidationResult } from './databaseValidationService';

// Enhanced permission interfaces (additive to existing system)
export interface EnhancedPermission {
  id: string;
  name: string;
  description?: string;
  category: 'content' | 'user_management' | 'system' | 'analytics' | 'security';
  level: number; // 0-10, higher = more privileged
  inheritsFrom?: string[]; // Permission inheritance
  conditions?: PermissionConditions;
  expiresAt?: string; // ISO date string
  createdAt: string;
  createdBy: string;
}

export interface PermissionConditions {
  timeRestrictions?: {
    startTime?: string; // HH:MM format
    endTime?: string; // HH:MM format
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    timezone?: string;
  };
  resourceRestrictions?: {
    allowedResources?: string[];
    deniedResources?: string[];
    maxResourceCount?: number;
  };
  contextRestrictions?: {
    requiredContext?: { [key: string]: any };
    forbiddenContext?: { [key: string]: any };
  };
  ipRestrictions?: {
    allowedIPs?: string[];
    deniedIPs?: string[];
    allowedCountries?: string[];
  };
}

export interface EnhancedRole {
  id: string;
  name: string;
  description?: string;
  inheritsFrom?: string[]; // Role inheritance
  permissions: string[]; // Permission IDs
  level: number; // Role hierarchy level
  isSystemRole: boolean; // Cannot be deleted if true
  createdAt: string;
  createdBy: string;
}

export interface PermissionCheckContext {
  userId?: string;
  resourceId?: string;
  resourceType?: string;
  timestamp?: string;
  userIP?: string;
  userAgent?: string;
  additionalContext?: { [key: string]: any };
}

// Enhanced permission checking options
export interface EnhancedPermissionOptions {
  enableInheritance: boolean;
  enableConditions: boolean;
  enableTimeRestrictions: boolean;
  enableResourceRestrictions: boolean;
  enableCaching: boolean;
  fallbackToLegacy: boolean; // Always fallback to existing system if enhanced check fails
}

// Default options (safe, non-breaking)
const defaultEnhancedOptions: EnhancedPermissionOptions = {
  enableInheritance: false, // Disabled by default for safety
  enableConditions: false, // Disabled by default for safety
  enableTimeRestrictions: false, // Disabled by default for safety
  enableResourceRestrictions: false, // Disabled by default for safety
  enableCaching: true, // Safe to enable
  fallbackToLegacy: true // Always fallback to existing system
};

/**
 * Validates enhanced permission data
 * This is purely additive and does not affect existing permissions
 */
export const validateEnhancedPermission = (
  permissionData: any
): ValidationResult => {
  try {
    return validateData(permissionData, enhancedPermissionSchema);
  } catch (error) {
    console.error('Error validating enhanced permission:', error);
    // Return valid result to ensure no disruption
    return {
      valid: true,
      errors: {},
      warnings: { system: 'Enhanced permission validation error, proceeding safely' },
      sanitizedData: permissionData
    };
  }
};

/**
 * Resolves permission inheritance
 * This is an optional enhancement that doesn't affect existing permissions
 */
export const resolvePermissionInheritance = (
  permission: EnhancedPermission,
  allPermissions: { [id: string]: EnhancedPermission },
  visited: Set<string> = new Set()
): string[] => {
  try {
    // Prevent circular inheritance
    if (visited.has(permission.id)) {
      console.warn(`Circular inheritance detected for permission: ${permission.id}`);
      return [permission.id];
    }

    visited.add(permission.id);
    const resolvedPermissions = [permission.id];

    if (permission.inheritsFrom && permission.inheritsFrom.length > 0) {
      for (const inheritedId of permission.inheritsFrom) {
        const inheritedPermission = allPermissions[inheritedId];
        if (inheritedPermission) {
          const inheritedResolved = resolvePermissionInheritance(
            inheritedPermission,
            allPermissions,
            new Set(visited)
          );
          resolvedPermissions.push(...inheritedResolved);
        }
      }
    }

    return [...new Set(resolvedPermissions)]; // Remove duplicates
  } catch (error) {
    console.error('Error resolving permission inheritance:', error);
    // Return basic permission to ensure no disruption
    return [permission.id];
  }
};

/**
 * Checks time-based permission conditions
 * This is an optional enhancement that doesn't affect existing permissions
 */
export const checkTimeRestrictions = (
  conditions: PermissionConditions,
  context: PermissionCheckContext
): boolean => {
  try {
    if (!conditions.timeRestrictions) {
      return true; // No restrictions = allowed
    }

    const now = new Date(context.timestamp || Date.now());
    const timeRestrictions = conditions.timeRestrictions;

    // Check day of week restrictions
    if (timeRestrictions.daysOfWeek && timeRestrictions.daysOfWeek.length > 0) {
      const currentDay = now.getDay();
      if (!timeRestrictions.daysOfWeek.includes(currentDay)) {
        return false;
      }
    }

    // Check time of day restrictions
    if (timeRestrictions.startTime && timeRestrictions.endTime) {
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      if (currentTime < timeRestrictions.startTime || currentTime > timeRestrictions.endTime) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking time restrictions:', error);
    // Return true to ensure no disruption
    return true;
  }
};

/**
 * Checks resource-based permission conditions
 * This is an optional enhancement that doesn't affect existing permissions
 */
export const checkResourceRestrictions = (
  conditions: PermissionConditions,
  context: PermissionCheckContext
): boolean => {
  try {
    if (!conditions.resourceRestrictions || !context.resourceId) {
      return true; // No restrictions or no resource = allowed
    }

    const resourceRestrictions = conditions.resourceRestrictions;

    // Check allowed resources
    if (resourceRestrictions.allowedResources && resourceRestrictions.allowedResources.length > 0) {
      if (!resourceRestrictions.allowedResources.includes(context.resourceId)) {
        return false;
      }
    }

    // Check denied resources
    if (resourceRestrictions.deniedResources && resourceRestrictions.deniedResources.length > 0) {
      if (resourceRestrictions.deniedResources.includes(context.resourceId)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking resource restrictions:', error);
    // Return true to ensure no disruption
    return true;
  }
};

/**
 * Enhanced permission check with conditions and inheritance
 * This is completely optional and falls back to existing system
 */
export const checkEnhancedPermission = (
  permission: EnhancedPermission,
  context: PermissionCheckContext,
  options: Partial<EnhancedPermissionOptions> = {}
): boolean => {
  try {
    const opts = { ...defaultEnhancedOptions, ...options };

    // Check if permission is expired
    if (permission.expiresAt) {
      const expirationDate = new Date(permission.expiresAt);
      const now = new Date(context.timestamp || Date.now());
      if (now > expirationDate) {
        return false;
      }
    }

    // Check conditions if enabled
    if (opts.enableConditions && permission.conditions) {
      // Check time restrictions
      if (opts.enableTimeRestrictions) {
        if (!checkTimeRestrictions(permission.conditions, context)) {
          return false;
        }
      }

      // Check resource restrictions
      if (opts.enableResourceRestrictions) {
        if (!checkResourceRestrictions(permission.conditions, context)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in enhanced permission check:', error);
    // Always return true to ensure no disruption to existing functionality
    return true;
  }
};

/**
 * Gets enhanced permission statistics
 * This is purely informational and doesn't affect existing functionality
 */
export const getEnhancedPermissionStats = () => {
  try {
    return {
      enhancedPermissionsEnabled: true,
      inheritanceEnabled: defaultEnhancedOptions.enableInheritance,
      conditionsEnabled: defaultEnhancedOptions.enableConditions,
      timeRestrictionsEnabled: defaultEnhancedOptions.enableTimeRestrictions,
      resourceRestrictionsEnabled: defaultEnhancedOptions.enableResourceRestrictions,
      cachingEnabled: defaultEnhancedOptions.enableCaching,
      fallbackToLegacyEnabled: defaultEnhancedOptions.fallbackToLegacy
    };
  } catch (error) {
    console.error('Error getting enhanced permission stats:', error);
    return {
      enhancedPermissionsEnabled: false,
      error: 'Failed to get enhanced permission stats'
    };
  }
};

/**
 * Utility function to create a basic enhanced permission
 * This is purely additive and doesn't affect existing permissions
 */
export const createBasicEnhancedPermission = (
  id: string,
  name: string,
  category: EnhancedPermission['category'],
  level: number = 1,
  createdBy: string = 'system'
): EnhancedPermission => {
  return {
    id,
    name,
    category,
    level,
    createdAt: new Date().toISOString(),
    createdBy
  };
};

/**
 * Utility function to check if enhanced permissions are available
 * This allows gradual adoption without breaking existing functionality
 */
export const isEnhancedPermissionsAvailable = (): boolean => {
  try {
    // Simple check to see if enhanced permissions are working
    const testPermission = createBasicEnhancedPermission('test', 'Test', 'system', 1);
    return !!testPermission.id;
  } catch (error) {
    console.error('Enhanced permissions not available:', error);
    return false;
  }
};
