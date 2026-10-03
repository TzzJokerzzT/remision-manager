import { AxiosError, AxiosHeaders } from 'axios';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';

/** Construye un AxiosError cuyo `response.data.message` es el mensaje del servidor. */
function apiError(serverMessage: string): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Fallo de red', AxiosError.ERR_BAD_REQUEST, config, undefined, {
    data: { message: serverMessage },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config,
  });
}

describe('getErrorMessage', () => {
  it('devuelve el mensaje de una instancia de Error', () => {
    expect(getErrorMessage(new Error('algo falló'))).toBe('algo falló');
  });

  it('prefiere el mensaje del servidor en un AxiosError', () => {
    expect(getErrorMessage(apiError('El correo ya está registrado'))).toBe('El correo ya está registrado');
  });

  it('usa el mensaje propio del AxiosError cuando no hay respuesta', () => {
    expect(getErrorMessage(new AxiosError('Sin respuesta'))).toBe('Sin respuesta');
  });

  it('usa el fallback para una cadena', () => {
    expect(getErrorMessage('algo falló')).toBe('Ocurrió un error inesperado');
  });

  it('usa el fallback para un objeto lanzado', () => {
    expect(getErrorMessage({ message: 'boom' })).toBe('Ocurrió un error inesperado');
  });

  it('usa el fallback para null y undefined', () => {
    expect(getErrorMessage(null)).toBe('Ocurrió un error inesperado');
    expect(getErrorMessage(undefined)).toBe('Ocurrió un error inesperado');
  });

  it('usa el fallback personalizado cuando se indica', () => {
    expect(getErrorMessage('algo falló', 'No se pudo guardar')).toBe('No se pudo guardar');
    expect(getErrorMessage(null, 'No se pudo guardar')).toBe('No se pudo guardar');
  });
});
