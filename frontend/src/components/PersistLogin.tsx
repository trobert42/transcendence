import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useRefreshToken } from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthStatusKnown, setIsAuthStatusKnown] = useState(false);

  const refresh = useRefreshToken();
  const { auth }: any = useAuth();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
      } finally {
        setIsLoading(false);
        setIsAuthStatusKnown(true);
      }
    };
    if (!auth?.accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
      setIsAuthStatusKnown(true);
    }
  // eslint-disable-next-line
  }, [setIsLoading]);

  return (
    <>{isAuthStatusKnown ? isLoading ? <p>Loading...</p> : <Outlet /> : null}</>
  );
};

export default PersistLogin;
