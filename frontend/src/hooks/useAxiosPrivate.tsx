import { useEffect } from 'react';
import { axiosPrivate } from '../utils/api';
import useAuth from './useAuth';
import { useRefreshToken } from './useRefreshToken';

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth }: any = useAuth();
  try {
    useEffect(() => {
      const requestIntercept = axiosPrivate?.interceptors.request.use(
        async (config: any) => {
          if (!config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
          }
          return config;
        },
        (error: any) => {
          return Promise.reject(error);
        },
      );

      const responseIntercept = axiosPrivate?.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
          const prevRequest = error?.config;
          if (error?.response?.status === 401 && !prevRequest?.sent) {
            prevRequest.sent = true;
            const newAccessToken = await refresh();
            prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          }
          return Promise.reject(error);
        },
      );

      return () => {
        axiosPrivate?.interceptors.request.eject(requestIntercept);
        axiosPrivate?.interceptors.response.eject(responseIntercept);
      };
    }, [auth, refresh]);

    return axiosPrivate;
  } catch (err) {
    if ((err as any).name === 'CanceledError') {
      return;
    }
  }
};

export default useAxiosPrivate;
