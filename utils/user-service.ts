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
  if(typeof window !== 'undefined') {
    localStorage?.setItem('user', JSON.stringify(user));
    localStorage?.setItem('token', token);
  }
}; 

export const getUser = (): User | null => {
  if(typeof window !== 'undefined') {
    const user = localStorage?.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export const Logout = () => {
  if(typeof window !== 'undefined') {
    localStorage?.removeItem('token');
  localStorage?.removeItem('user');
  window.location.href = '/user/login';
}};

export const IsLoggedIn = (): boolean => {
  if(typeof window !== 'undefined') {
    const token = localStorage?.getItem('token');
    return token ? true : false;
  } 
};
