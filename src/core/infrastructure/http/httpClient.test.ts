import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosStatic,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';
import axios, { AxiosError as AxiosErrorClass, AxiosHeaders } from 'axios';
import { httpClient, registerForcedLogoutHandler } from '@/src/core/infrastructure/http/httpClient';
import { tokenStorage } from '@/src/core/infrastructure/storage/tokenStorage';

jest.mock('axios', () => {
  const actual = jest.requireActual<AxiosStatic>('axios');
  return {
    create: jest.fn((config: CreateAxiosDefaults) => actual.create(config)),
    AxiosError: actual.AxiosError,
    AxiosHeaders: actual.AxiosHeaders,
  };
});

// httpClient.ts llama a axios.create dos veces: primero httpClient, después rawClient.
// Se capturan ambas instancias reales en el cuerpo del módulo (antes de que `clearMocks`
// borre `mock.results` entre tests) para poder controlar el POST de refresh de rawClient.
const createMock = axios.create as jest.Mock;
const createdClients: AxiosInstance[] = createMock.mock.results.map(
  (result) => result.value as AxiosInstance
);

function rawClient(): AxiosInstance {
  const client = createdClients[1];
  if (!client) throw new Error('rawClient no fue creado por el módulo');
  return client;
}

function okResponse<T>(data: T, config: InternalAxiosRequestConfig): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config };
}

function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosErrorClass('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
    data: undefined,
    status: 401,
    statusText: 'Unauthorized',
    headers: new AxiosHeaders(),
    config,
  });
}

// Respuesta mínima de /auth/refresh: el interceptor solo lee data.data.{accessToken,refreshToken}.
function refreshResponse(): AxiosResponse {
  return {
    data: { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } },
  } as unknown as AxiosResponse;
}

describe('httpClient interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('request', () => {
    it('adjunta el token de acceso en Authorization cuando existe', async () => {
      const adapter = jest.fn(async (config: InternalAxiosRequestConfig) =>
        okResponse({ items: [] }, config)
      );
      tokenStorage.setTokens('access-1', 'refresh-1');

      await httpClient.get('/remisiones', { adapter });

      expect(adapter).toHaveBeenCalledTimes(1);
      expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer access-1');
    });

    it('no adjunta Authorization cuando no hay token', async () => {
      const adapter = jest.fn(async (config: InternalAxiosRequestConfig) =>
        okResponse({ items: [] }, config)
      );

      await httpClient.get('/remisiones', { adapter });

      expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBeUndefined();
    });
  });

  describe('response', () => {
    it('deja pasar los errores que no son 401 sin refrescar ni cerrar sesión', async () => {
      const onLogout = jest.fn();
      registerForcedLogoutHandler(onLogout);
      const rawPost = jest.spyOn(rawClient(), 'post');

      const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
        throw new AxiosErrorClass('Server error', 'ERR_BAD_RESPONSE', config, undefined, {
          data: undefined,
          status: 500,
          statusText: 'Error',
          headers: new AxiosHeaders(),
          config,
        });
      });

      await expect(httpClient.get('/remisiones', { adapter })).rejects.toMatchObject({
        response: { status: 500 },
      });

      expect(rawPost).not.toHaveBeenCalled();
      expect(onLogout).not.toHaveBeenCalled();
    });

    it('en un 401 de /auth/ limpia la sesión y notifica logout sin reintentar', async () => {
      const onLogout = jest.fn();
      registerForcedLogoutHandler(onLogout);
      const rawPost = jest.spyOn(rawClient(), 'post');
      tokenStorage.setTokens('access-1', 'refresh-1');

      const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
        throw unauthorized(config);
      });

      await expect(
        httpClient.post('/auth/login', { email: 'ana@correo.com', password: 'x' }, { adapter })
      ).rejects.toMatchObject({ response: { status: 401 } });

      expect(rawPost).not.toHaveBeenCalled();
      expect(onLogout).toHaveBeenCalledTimes(1);
      expect(tokenStorage.getAccessToken()).toBeNull();
    });

    it('en un 401 sin refresh token limpia la sesión y notifica logout', async () => {
      const onLogout = jest.fn();
      registerForcedLogoutHandler(onLogout);
      const rawPost = jest.spyOn(rawClient(), 'post');

      const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
        throw unauthorized(config);
      });

      await expect(httpClient.get('/remisiones', { adapter })).rejects.toMatchObject({
        response: { status: 401 },
      });

      expect(rawPost).not.toHaveBeenCalled();
      expect(onLogout).toHaveBeenCalledTimes(1);
      expect(tokenStorage.getAccessToken()).toBeNull();
    });

    it('refresca el token y reintenta la petición original con el nuevo token', async () => {
      const onLogout = jest.fn();
      registerForcedLogoutHandler(onLogout);
      const rawPost = jest.spyOn(rawClient(), 'post').mockResolvedValue(refreshResponse());
      tokenStorage.setTokens('old-access', 'old-refresh');

      let calls = 0;
      const adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
        calls += 1;
        if (calls === 1) throw unauthorized(config);
        return okResponse({ items: [] }, config);
      });

      const result = await httpClient.get('/remisiones', { adapter });

      expect(result.data).toEqual({ items: [] });
      expect(rawPost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh' });
      expect(tokenStorage.getAccessToken()).toBe('new-access');
      expect(tokenStorage.getRefreshToken()).toBe('new-refresh');
      expect(onLogout).not.toHaveBeenCalled();
      expect(adapter).toHaveBeenCalledTimes(2);

      const retryConfig = adapter.mock.calls[1][0];
      expect(retryConfig.headers.get('Authorization')).toBe('Bearer new-access');
      expect((retryConfig as InternalAxiosRequestConfig & { _retry?: boolean })._retry).toBe(true);
    });
  });
});
