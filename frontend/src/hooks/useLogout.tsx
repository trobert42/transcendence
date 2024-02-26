import useAuth from './useAuth';
import axios from '../utils/api';

const useLogout = () => {
  const { setAuth }: any = useAuth();

  const logout = async () => {
    try {
      setAuth({});
      await axios('/auth/signout', {
        withCredentials: true,
      });
    } catch (err) {
      if ((err as any).name === 'CanceledError') {
        return;
      }
    }
  };

  return logout;
};

export default useLogout;
