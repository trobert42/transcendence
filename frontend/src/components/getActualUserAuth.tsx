import axios from 'axios';

const getActualUserAuth = async (setAuth: Function) => {
  let user: any;
  try {
    user = await axios.get('http://localhost:3333/users/me', {
      withCredentials: true,
    });
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 401) {
      return;
    }
  }
  if (user) {
    setAuth(() => {
      return {
        username: user?.data?.username,
        email: user?.data?.email,
        id: user?.data?.id,
        firstname: user?.data?.firstname,
        lastname: user?.data?.lastname,
        accessToken: user?.data?.accessToken,
        access42Token: user?.data?.access42Token,
        refreshToken: user?.data?.refreshToken,
        isLogged: user?.data?.isLogged,
        is2FAEnabled: user?.data?.is2FAEnabled,
        is42User: user?.data?.is42User,
        avatarLink: user?.data?.avatarLink,
        isDoneRegister: user?.data?.isDoneRegister,
      };
    });
  }
  return user;
};

export default getActualUserAuth;
