'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { 
  type UserRole, 
  isRoleAllowed
} from '@/lib/config/route-permissions';

export interface UseRoleGuardOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export interface UseRoleGuardReturn {
  isAuthorized: boolean;
  isLoading: boolean;
  checkPermission: (path?: string) => boolean;
}

/**
 * Hook for role-based access control
 * Verifies if the current user has permission to access a route based on their role
 * 
 * @param options - Configuration options for the guard
 * @param options.allowedRoles - Array of roles allowed to access the route
 * @param options.redirectTo - Optional custom redirect path (defaults to role-specific redirect)
 * @param options.onUnauthorized - Optional callback when access is denied
 * @returns Object with authorization state and helper functions
 * 
 * @example
 * ```tsx
 * const { isAuthorized, isLoading } = useRoleGuard({
 *   allowedRoles: ['CANDIDATE']
 * });
 * 
 * if (isLoading) return <Loading />;
 * if (!isAuthorized) return <Unauthorized />;
 * 
 * return <ProtectedContent />;
 * ```
 */
export function useRoleGuard(options: UseRoleGuardOptions): UseRoleGuardReturn {
  const { allowedRoles } = options;
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();

  const isAuthorized = useMemo(() => {
    if (authLoading) {
      return false;
    }

    if (!user || !user.role) {
      return false;
    }

    return allowedRoles.includes(user.role);
  }, [user, allowedRoles, authLoading]);

  /**
   * Checks if a user role is allowed to access a specific route path
   * Uses the route permissions configuration to determine access
   * 
   * @param path - Optional path to check (defaults to current pathname)
   * @returns true if the user role is allowed to access the route
   */
  const checkPermission = (path?: string): boolean => {
    const routePath = path || pathname;
    const userRole = user?.role as UserRole | null | undefined;
    
    return isRoleAllowed(routePath, userRole);
  };

  return {
    isAuthorized,
    isLoading: authLoading,
    checkPermission,
  };
}

