import useAuth from './useAuth';
import axios from '../utils/api';
import { getRemoveCookie } from '../utils/api';

export const useRefreshToken = () => {
  const { setAuth }: any = useAuth();

  const refresh = async () => {
    const response = await axios('/auth/refresh', {
      withCredentials: true,
    })
      .then((response: any) => {
        return response;
      })
      .catch((err: any) => {
        getRemoveCookie(setAuth);
        throw err;
      });

    const user = await axios('/users/me', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${response.data.accessToken}`,
      },
    })
      .then((response: any) => {
        return response;
      })
      .catch((err: any) => {
        getRemoveCookie(setAuth);
        throw err;
      });
    if (user) {
      setAuth(() => {
        return {
          username: user.data.username,
          email: user.data.email,
          id: user.data.id,
          firstname: user.data.firstname,
          lastname: user.data.lastname,
          accessToken: response.data.accessToken,
          access42Token: user.data.access42Token,
          refreshToken: user.data.refreshToken,
          isLogged: user.data.isLogged,
          is2FAEnabled: user.data.is2FAEnabled,
          is42User: user.data.is42User,
          avatarLink: user.data.avatarLink,
          isDoneRegister: user.data.isDoneRegister,
          blockedUsers: user.data.blockedUsers,
        };
      });
    }
    return response.data.accessToken;
  };
  return refresh;
};
