import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from './AuthContext';

// Define the shape of our permissions
interface Permissions {
  [key: string]: boolean;
}

// Define the shape of our permissions context
interface PermissionsContextType {
  permissions: Permissions;
  roles: {
    [role: string]: Permissions;
  };
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isLoading: boolean;
}

// Create the permissions context
const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

/**
 * Provider component for the permissions context
 */
export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({});
  const [roles, setRoles] = useState<{ [role: string]: Permissions }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Determine if user is admin or moderator
  const isAdmin = userProfile?.role === 'admin';
  const isModerator = userProfile?.role === 'moderator';
  
  // Load role definitions
  useEffect(() => {
    const rolesRef = ref(database, 'permissions/roles');
    
    const unsubscribe = onValue(rolesRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoles(snapshot.val());
      } else {
        // If no roles defined, use default roles
        setRoles({
          user: {
            canReadPublicContent: true,
            canSubmitReviews: true,
            canCreateBookings: true,
            canManageOwnProfile: true,
            canParticipateInCommunity: true
          },
          moderator: {
            canReadPublicContent: true,
            canSubmitReviews: true,
            canCreateBookings: true,
            canManageOwnProfile: true,
            canParticipateInCommunity: true,
            canModerateContent: true,
            canManageBookings: true,
            canAccessAdminPanel: true,
            canViewAnalytics: true,
            canManagePortfolio: true,
            canManageServices: true,
            canManagePricing: true,
            canManageCommunity: true
          },
          admin: {
            canReadPublicContent: true,
            canSubmitReviews: true,
            canCreateBookings: true,
            canManageOwnProfile: true,
            canParticipateInCommunity: true,
            canModerateContent: true,
            canManageBookings: true,
            canAccessAdminPanel: true,
            canViewAnalytics: true,
            canManagePortfolio: true,
            canManageServices: true,
            canManagePricing: true,
            canManageCommunity: true,
            canManageUsers: true,
            canManageRoles: true,
            canManageSecurity: true,
            canManageSEO: true,
            canManageSystem: true,
            canBypassRateLimits: true
          }
        });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load user permissions
  useEffect(() => {
    if (!user) {
      setPermissions({});
      setIsLoading(false);
      return;
    }
    
    // Get user permissions from profile
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        
        // First check if user has custom permissions
        const userPermissionsRef = ref(database, `profile/${user.uid}/permissions`);
        const userPermissionsSnapshot = await get(userPermissionsRef);
        
        if (userPermissionsSnapshot.exists()) {
          // User has custom permissions
          setPermissions(userPermissionsSnapshot.val());
        } else if (userProfile?.role) {
          // User has a role but no custom permissions, use role permissions
          const rolePermissionsRef = ref(database, `permissions/roles/${userProfile.role}`);
          const rolePermissionsSnapshot = await get(rolePermissionsRef);
          
          if (rolePermissionsSnapshot.exists()) {
            setPermissions(rolePermissionsSnapshot.val());
          } else {
            // Role not found, use default user permissions
            setPermissions({
              canReadPublicContent: true,
              canSubmitReviews: true,
              canCreateBookings: true,
              canManageOwnProfile: true,
              canParticipateInCommunity: true
            });
          }
        } else {
          // No role or custom permissions, use default user permissions
          setPermissions({
            canReadPublicContent: true,
            canSubmitReviews: true,
            canCreateBookings: true,
            canManageOwnProfile: true,
            canParticipateInCommunity: true
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading permissions:', error);
        
        // Set default permissions on error
        setPermissions({
          canReadPublicContent: true,
          canSubmitReviews: true,
          canCreateBookings: true,
          canManageOwnProfile: true,
          canParticipateInCommunity: true
        });
        
        setIsLoading(false);
      }
    };
    
    loadPermissions();
    
    // Subscribe to permission changes
    const userPermissionsRef = ref(database, `profile/${user.uid}/permissions`);
    const unsubscribe = onValue(userPermissionsRef, (snapshot) => {
      if (snapshot.exists()) {
        setPermissions(snapshot.val());
      }
    });
    
    return () => unsubscribe();
  }, [user, userProfile]);
  
  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    // Admin has all permissions
    if (isAdmin) return true;
    
    // Check if user has the specific permission
    return !!permissions[permission];
  };
  
  // Create the context value
  const value: PermissionsContextType = {
    permissions,
    roles,
    hasPermission,
    isAdmin,
    isModerator,
    isLoading
  };
  
  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

/**
 * Hook to use the permissions context
 */
export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  
  return context;
};
