import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type RequiredRole = 'ADMIN' | 'USER';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: RequiredRole | RequiredRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { currentUser, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(currentUser!.role)) {
      return <Navigate to="/trips" replace />;
    }
  }

  return <>{children}</>;
}
