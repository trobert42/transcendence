import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RequireAuth = () => {
  const { auth }: any = useAuth();
  const location = useLocation();
  return auth?.accessToken && auth?.isDoneRegister ? (
    <Outlet />
  ) : (
    <Navigate to="/auth/signin" state={{ from: location }} replace />
  );
};

export default RequireAuth;
