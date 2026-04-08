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
    return <Navigate to="/dashboard/client/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
