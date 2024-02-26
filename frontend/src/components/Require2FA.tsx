import { useLocation, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import getActualUserAuth from './getActualUserAuth';
import { useEffect, useState } from 'react';
import TwoFAPage from '../pages/TwoFAPage';

const Require2FA = () => {
  const [loading, setLoading] = useState(true);
  const { auth, setAuth }: any = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchAuth = async () => {
      await getActualUserAuth(setAuth);
      setLoading(false);
    };

    fetchAuth();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    if (auth && !auth.isLogged && auth.is2FAEnabled) {
      return <TwoFAPage />;
    } else if (auth?.isLogged) {
      return <Navigate to="/" replace />;
    } else {
      return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }
  }
};

export default Require2FA;
