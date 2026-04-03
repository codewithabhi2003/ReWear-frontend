import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuth, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuth) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
