/**
 * Route permissions configuration
 * Centralizes route-to-role mapping and default redirects for role-based access control
 */

export type UserRole = 'CANDIDATE' | 'EMPLOYER';

/**
 * Mapping of routes to allowed roles
 * Routes can use wildcard pattern (**) to match sub-routes
 */
export const ROUTE_PERMISSIONS: Record<string, readonly UserRole[]> = {
  '/feed': ['CANDIDATE'],
  '/profile': ['CANDIDATE'],
  '/applications': ['CANDIDATE'],
  '/dashboard/employer': ['EMPLOYER'],
  '/dashboard/employer/**': ['EMPLOYER'],
} as const;

/**
 * Default redirect paths for each role when access is denied
 */
export const DEFAULT_REDIRECTS: Record<UserRole, string> = {
  CANDIDATE: '/feed',
  EMPLOYER: '/dashboard/employer',
} as const;

/**
 * Checks if a given path matches a route pattern
 * Supports wildcard pattern (**) for matching sub-routes
 * 
 * @param path - The path to check (e.g., '/dashboard/employer/jobs/123')
 * @param pattern - The pattern to match against (e.g., '/dashboard/employer/**')
 * @returns true if the path matches the pattern
 * 
 * @example
 * matchesRoutePattern('/dashboard/employer/jobs/123', '/dashboard/employer/**') // true
 * matchesRoutePattern('/feed', '/feed') // true
 * matchesRoutePattern('/profile', '/feed') // false
 */
export function matchesRoutePattern(path: string, pattern: string): boolean {
  // Exact match
  if (path === pattern) {
    return true;
  }

  if (pattern.endsWith('/**')) {
    const basePattern = pattern.slice(0, -3);
    return path.startsWith(basePattern);
  }

  return false;
}

/**
 * Gets the allowed roles for a given route path
 * Checks both exact matches and wildcard patterns
 * 
 * @param path - The route path to check
 * @returns Array of allowed roles, or empty array if route is not restricted
 */
export function getAllowedRoles(path: string): readonly UserRole[] {
  // First, try exact match
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }

  const wildcardPatterns = Object.keys(ROUTE_PERMISSIONS)
    .filter(pattern => pattern.endsWith('/**'))
    .sort((a, b) => b.length - a.length);

  for (const pattern of wildcardPatterns) {
    if (matchesRoutePattern(path, pattern)) {
      return ROUTE_PERMISSIONS[pattern];
    }
  }

  return [];
}

/**
 * Checks if a user role is allowed to access a given route
 * 
 * @param path - The route path to check
 * @param userRole - The user's role
 * @returns true if the user role is allowed to access the route
 */
export function isRoleAllowed(path: string, userRole: UserRole | null | undefined): boolean {
  if (!userRole) {
    return false;
  }

  const allowedRoles = getAllowedRoles(path);
  
  if (allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.includes(userRole);
}

/**
 * Gets the default redirect path for a user role
 * 
 * @param userRole - The user's role
 * @returns The default redirect path for the role
 */
export function getDefaultRedirect(userRole: UserRole): string {
  return DEFAULT_REDIRECTS[userRole];
}

