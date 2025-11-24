'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRoleGuard } from '@/hooks/use-role-guard';
import { getDefaultRedirect, type UserRole } from '@/lib/config/route-permissions';

export interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * RoleGuard component
 * Protects routes by verifying user role permissions before rendering content
 * 
 * Displays loading state during verification, shows error toast and redirects
 * when access is denied, and renders children only when authorized.
 * 
 * @param props - Component props
 * @param props.allowedRoles - Array of roles allowed to access the route
 * @param props.redirectTo - Optional custom redirect path (defaults to role-specific redirect)
 * @param props.children - Content to render when authorized
 * 
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={['CANDIDATE']}>
 *   <ProtectedPage />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({ allowedRoles, redirectTo, children }: RoleGuardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isAuthorized, isLoading } = useRoleGuard({ allowedRoles });
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthorized) {
      hasRedirected.current = false;
      return;
    }

    if (!isAuthorized && !hasRedirected.current) {
      hasRedirected.current = true;

      toast.error('Você não tem permissão para acessar esta página', {
        description: 'Você será redirecionado em instantes.',
      });

      const redirectPath = redirectTo || (() => {
        if (user?.role) {
          return getDefaultRedirect(user.role);
        }

        return '/auth/login';
      })();

      const redirectTimer = setTimeout(() => {
        router.push(redirectPath);
      }, 500);

      return () => {
        clearTimeout(redirectTimer);
      };
    }
  }, [isAuthorized, isLoading, redirectTo, router, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

