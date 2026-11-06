import axios from 'axios';

const TOKEN_KEY = 'pg_admin_token';
const EXP_KEY = 'pg_admin_token_exp';

export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const exp = Number(localStorage.getItem(EXP_KEY) || 0);
    if (!token || (exp && exp * 1000 < Date.now())) {
      clearToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
};

export const setToken = (token, expiresAt) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXP_KEY, String(expiresAt || 0));
};

export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXP_KEY);
  } catch {
    /* ignore */
  }
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  clearToken();
  window.location.href = '/login';
};

// Attach the token to every API call and bounce to /login when it expires.
let installed = false;
export const installAuthInterceptors = () => {
  if (installed) return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      const url = err?.config?.url || '';
      const isPublic = url.includes('/seo/shared/') || url.includes('/auth/login');
      if (err?.response?.status === 401 && !isPublic) {
        clearToken();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(err);
    }
  );
};
