import { Navigate } from 'react-router-dom';
import { useMockAuth, UserRole } from '@/contexts/MockAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser } = useMockAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on role
    if (currentUser.role === 'owner' || currentUser.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (currentUser.role === 'authority' || currentUser.role === 'authority_standard') {
      return <Navigate to="/dashboard/authority" replace />;
    } else {
      return <Navigate to="/dashboard/client/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
