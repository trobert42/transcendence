import axios, { AxiosRequestConfig } from 'axios';
import {
  CreateUserParams,
  EditUserParams,
  EmailParams,
  Login2FAParams,
  LoginParams,
} from './types';

const BACKEND_URL = `http://${window.location.hostname}:3333`;

const config: AxiosRequestConfig = {
  withCredentials: true,
};

export default axios.create({
  baseURL: BACKEND_URL,
});

/////// FOR REFRESH TOKEN ///////
export const axiosPrivate = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/////// FOR LOCAL SIGNIN/SIGNUP ///////
export const postLoginUser = (data: LoginParams) =>
  axios.post(`${BACKEND_URL}/auth/local-signin`, data, config);

export const postRegisterUser = async (data: CreateUserParams) => {
  try {
    // eslint-disable-next-line
    const response = await axios.post(
      `${BACKEND_URL}/auth/signup`,
      data,
      config,
    );
  } catch (err) {
    throw err;
  }
};

/////// FOR 2FA AUTH ///////
export const postSignin42with2FA = async (data: any) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/2fa/42-signin`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postLogin2FAUser = async (data: Login2FAParams) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/2fa/signin`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const getQrCode = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/auth/2fa/get-qr-code`,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postVerifyCode = async (data: any) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/2fa/verify-qr-code`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postUpdate2FA = async (data: any) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/2fa/update`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

/////// CHECK AUTH ///////
export const postCheckFirstSignin = async (data: EditUserParams) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/check-first-signin`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postCheckUserCredentials = async (data: LoginParams) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/check-signin`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postCheckEmail = async (
  data: EmailParams,
): Promise<{ data?: any }> => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/auth/check-email`,
      data,
      config,
    );
    return { data: response.data };
  } catch (err) {
    throw err;
  }
};

/////// EDIT USER ///////

export const postEditingUserFirstLogin = async (data: EditUserParams) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/users/edit-user-first-login`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postEditingUser = async (data: EditUserParams) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/users/edit-user`,
      data,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const postEditAvatarPicture = async (formData: FormData) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/users/edit-avatar`,
      formData,
      {
        withCredentials: true,
        headers: {
          'content-type': 'multipart/form-data',
        },
      },
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const getSetupDefaultProfile = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/users/setup-default-profile`,
      config,
    );
    return response;
  } catch (err) {
    throw err;
  }
};

export const getRemoveCookie = async (setAuth: (props: any) => void) => {
  try {
    if (!setAuth) return;
    setAuth(null);
    const response = await axios.get(`${BACKEND_URL}/auth/signout`, config);
    return response;
  } catch (err) {
    if ((err as any).name === 'CanceledError') {
      // Ignore canceled errors
      return;
    }
  }
};
