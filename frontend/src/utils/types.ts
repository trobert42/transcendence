export type CreateUserParams = {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmPassword: string;
};

export type EditUserParams = {
  username: string;
  firstname: string;
  lastname: string;
  isDoneRegister?: boolean;
};

export type EditUserFirstLoginParams = {
  username: string;
  firstname: string;
  lastname: string;
  isDoneRegister: boolean;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type Login2FAParams = {
  email: string;
  password: string;
  code: string;
};

export type UsernameParams = {
  username: string;
};

export type EmailParams = {
  email: string;
};
