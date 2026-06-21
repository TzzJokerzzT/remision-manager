import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { appConfig } from '@/src/shared/config/env';
import { tokenStorage } from '../storage/tokenStorage';

export const httpClient = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Cliente "limpio" sin interceptores, usado solo para el endpoint de refresh
// (evita loops infinitos de reintento).
const rawClient = axios.create({
  baseURL: appConfig.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  for (const p of pendingQueue) {
    if (error || !token) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  }
  pendingQueue = [];
}

// Permite que capas externas reaccionen a un logout forzado (token inválido)
type LogoutHandler = () => void;
let onForcedLogout: LogoutHandler | null = null;
export function registerForcedLogoutHandler(handler: LogoutHandler) {
  onForcedLogout = handler;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // No reintentar refresh ni login/register, evita recursión
    if (originalRequest.url?.includes('/auth/')) {
      tokenStorage.clear();
      onForcedLogout?.();
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clear();
      onForcedLogout?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(httpClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await rawClient.post('/auth/refresh', { refreshToken });
      const newAccessToken = data.data.accessToken as string;
      const newRefreshToken = data.data.refreshToken as string;

      tokenStorage.setTokens(newAccessToken, newRefreshToken);
      processQueue(null, newAccessToken);

      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStorage.clear();
      onForcedLogout?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
