/**
 * Enhanced Permissions Context
 * 
 * This context provides advanced permission features as an ADDITIVE EXTENSION
 * to the existing PermissionsContext. It does NOT modify or replace any existing
 * permission logic and maintains 100% backward compatibility.
 * 
 * CRITICAL: This context is completely optional and does not affect existing
 * functionality. All current permission checks continue to work unchanged.
 * 
 * The existing PermissionsContext remains the primary permission system.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { usePermissions } from './PermissionsContext'; // Use existing permissions as base
import {
  EnhancedPermission,
  EnhancedRole,
  PermissionCheckContext,
  EnhancedPermissionOptions,
  checkEnhancedPermission,
  resolvePermissionInheritance,
  isEnhancedPermissionsAvailable,
  getEnhancedPermissionStats
} from '../services/enhancedPermissionsService';

// Enhanced permissions context interface (additive to existing)
interface EnhancedPermissionsContextType {
  // Enhanced permission data
  enhancedPermissions: { [id: string]: EnhancedPermission };
  enhancedRoles: { [id: string]: EnhancedRole };
  
  // Enhanced permission checking
  hasEnhancedPermission: (permissionId: string, context?: PermissionCheckContext) => boolean;
  checkPermissionWithConditions: (permissionId: string, context: PermissionCheckContext) => boolean;
  
  // Permission inheritance
  getInheritedPermissions: (permissionId: string) => string[];
  
  // Enhanced role management
  getUserEnhancedRoles: () => EnhancedRole[];
  
  // System status
  isEnhancedSystemAvailable: boolean;
  enhancedSystemStats: any;
  
  // Loading state
  isEnhancedLoading: boolean;
  
  // Fallback to legacy system
  legacyPermissions: any; // Reference to existing permissions
}

// Create the enhanced permissions context
const EnhancedPermissionsContext = createContext<EnhancedPermissionsContextType | undefined>(undefined);

/**
 * Provider component for enhanced permissions
 * This wraps and extends the existing permission system
 */
export const EnhancedPermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const legacyPermissions = usePermissions(); // Use existing permissions as base
  
  // Enhanced permission state
  const [enhancedPermissions, setEnhancedPermissions] = useState<{ [id: string]: EnhancedPermission }>({});
  const [enhancedRoles, setEnhancedRoles] = useState<{ [id: string]: EnhancedRole }>({});
  const [isEnhancedLoading, setIsEnhancedLoading] = useState<boolean>(false);
  const [isEnhancedSystemAvailable, setIsEnhancedSystemAvailable] = useState<boolean>(false);
  const [enhancedSystemStats, setEnhancedSystemStats] = useState<any>({});

  // Check if enhanced permissions are available
  useEffect(() => {
    try {
      const available = isEnhancedPermissionsAvailable();
      setIsEnhancedSystemAvailable(available);
      
      if (available) {
        const stats = getEnhancedPermissionStats();
        setEnhancedSystemStats(stats);
      }
    } catch (error) {
      console.error('Error checking enhanced permissions availability:', error);
      setIsEnhancedSystemAvailable(false);
    }
  }, []);

  // Load enhanced permissions (optional, non-breaking)
  useEffect(() => {
    if (!user || !isEnhancedSystemAvailable) {
      return;
    }

    const loadEnhancedPermissions = async () => {
      try {
        setIsEnhancedLoading(true);
        
        // This would load enhanced permissions from Firebase
        // For now, we'll use empty objects to ensure no disruption
        setEnhancedPermissions({});
        setEnhancedRoles({});
        
        setIsEnhancedLoading(false);
      } catch (error) {
        console.error('Error loading enhanced permissions:', error);
        // Ensure no disruption by setting empty state
        setEnhancedPermissions({});
        setEnhancedRoles({});
        setIsEnhancedLoading(false);
      }
    };

    loadEnhancedPermissions();
  }, [user, isEnhancedSystemAvailable]);

  /**
   * Enhanced permission check with fallback to legacy system
   * This ensures existing functionality is never broken
   */
  const hasEnhancedPermission = (
    permissionId: string, 
    context: PermissionCheckContext = {}
  ): boolean => {
    try {
      // Always fallback to legacy system first
      if (legacyPermissions.hasPermission(permissionId)) {
        return true;
      }

      // If enhanced system is not available, use legacy result
      if (!isEnhancedSystemAvailable) {
        return legacyPermissions.hasPermission(permissionId);
      }

      // Check enhanced permission if available
      const enhancedPermission = enhancedPermissions[permissionId];
      if (enhancedPermission) {
        return checkEnhancedPermission(enhancedPermission, context, {
          fallbackToLegacy: true // Always fallback
        });
      }

      // Default to legacy system
      return legacyPermissions.hasPermission(permissionId);
    } catch (error) {
      console.error('Error in enhanced permission check:', error);
      // Always fallback to legacy system on error
      return legacyPermissions.hasPermission(permissionId);
    }
  };

  /**
   * Permission check with conditions (optional enhancement)
   */
  const checkPermissionWithConditions = (
    permissionId: string,
    context: PermissionCheckContext
  ): boolean => {
    try {
      // Always check legacy system first
      if (!legacyPermissions.hasPermission(permissionId)) {
        return false;
      }

      // If enhanced system is not available, use legacy result
      if (!isEnhancedSystemAvailable) {
        return true;
      }

      // Apply enhanced conditions if available
      const enhancedPermission = enhancedPermissions[permissionId];
      if (enhancedPermission) {
        return checkEnhancedPermission(enhancedPermission, context, {
          enableConditions: true,
          enableTimeRestrictions: true,
          enableResourceRestrictions: true,
          fallbackToLegacy: true
        });
      }

      // Default to legacy result
      return true;
    } catch (error) {
      console.error('Error in conditional permission check:', error);
      // Always fallback to legacy system on error
      return legacyPermissions.hasPermission(permissionId);
    }
  };

  /**
   * Get inherited permissions (optional enhancement)
   */
  const getInheritedPermissions = (permissionId: string): string[] => {
    try {
      if (!isEnhancedSystemAvailable) {
        return [permissionId]; // Return basic permission
      }

      const enhancedPermission = enhancedPermissions[permissionId];
      if (enhancedPermission) {
        return resolvePermissionInheritance(enhancedPermission, enhancedPermissions);
      }

      return [permissionId];
    } catch (error) {
      console.error('Error getting inherited permissions:', error);
      return [permissionId];
    }
  };

  /**
   * Get user's enhanced roles (optional enhancement)
   */
  const getUserEnhancedRoles = (): EnhancedRole[] => {
    try {
      if (!isEnhancedSystemAvailable || !user) {
        return [];
      }

      // This would return user's enhanced roles
      // For now, return empty array to ensure no disruption
      return [];
    } catch (error) {
      console.error('Error getting user enhanced roles:', error);
      return [];
    }
  };

  // Create the context value
  const value: EnhancedPermissionsContextType = {
    enhancedPermissions,
    enhancedRoles,
    hasEnhancedPermission,
    checkPermissionWithConditions,
    getInheritedPermissions,
    getUserEnhancedRoles,
    isEnhancedSystemAvailable,
    enhancedSystemStats,
    isEnhancedLoading,
    legacyPermissions // Always provide access to legacy system
  };

  return (
    <EnhancedPermissionsContext.Provider value={value}>
      {children}
    </EnhancedPermissionsContext.Provider>
  );
};

/**
 * Hook to use enhanced permissions
 * This is completely optional and doesn't affect existing usePermissions hook
 */
export const useEnhancedPermissions = (): EnhancedPermissionsContextType => {
  const context = useContext(EnhancedPermissionsContext);
  
  if (context === undefined) {
    // If enhanced permissions are not available, provide a safe fallback
    const legacyPermissions = usePermissions();
    
    return {
      enhancedPermissions: {},
      enhancedRoles: {},
      hasEnhancedPermission: (permissionId: string) => legacyPermissions.hasPermission(permissionId),
      checkPermissionWithConditions: (permissionId: string) => legacyPermissions.hasPermission(permissionId),
      getInheritedPermissions: (permissionId: string) => [permissionId],
      getUserEnhancedRoles: () => [],
      isEnhancedSystemAvailable: false,
      enhancedSystemStats: {},
      isEnhancedLoading: false,
      legacyPermissions
    };
  }
  
  return context;
};

/**
 * Utility hook to check if enhanced permissions should be used
 * This allows gradual adoption without breaking existing functionality
 */
export const useEnhancedPermissionsStatus = () => {
  const enhanced = useEnhancedPermissions();
  const legacy = usePermissions();
  
  return {
    enhancedAvailable: enhanced.isEnhancedSystemAvailable,
    legacyWorking: !legacy.isLoading,
    shouldUseEnhanced: enhanced.isEnhancedSystemAvailable && !enhanced.isEnhancedLoading,
    stats: enhanced.enhancedSystemStats
  };
};
