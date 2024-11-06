export interface User {
  id: number;
  email: string;
  name: string;
  token: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export const SetUser = (user: User, token: string) => {
  localStorage?.setItem('user', JSON.stringify(user));
  localStorage?.setItem('token', token);
}; 

export const getUser = (): User | null => {
  const user = localStorage?.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const Logout = () => {
  localStorage?.removeItem('token');
  localStorage?.removeItem('user');
  window.location.href = '/user/login';
};

export const IsLoggedIn = (): boolean => {
  const token = localStorage?.getItem('token');
  return token ? true : false;
};
