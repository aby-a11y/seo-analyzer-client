import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '@/lib/auth';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

export default RequireAuth;
