'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner } from '@devteam/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, pathname, redirectTo]);

  if (status === 'loading') {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}

// HOC version for easier wrapping
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string },
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={options?.redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking auth status
export function useRequireAuth(redirectTo = '/login') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, pathname, redirectTo]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
