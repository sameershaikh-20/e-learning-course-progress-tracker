import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace state={{ from: location }}/>;
  }
  return role && user.role !== role ? <Navigate to="/dashboard" replace/> : <Outlet/>;
}
