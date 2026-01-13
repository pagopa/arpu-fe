import { setupInterceptors } from './interceptors';
import { Client } from 'models/Client';
import { useNavigate } from 'react-router-dom';
import storage from './storage';
import { ArcRoutes, ArcErrors } from 'routes/routes';
import { Mock } from 'vitest';
import utils from 'utils';

vi.mock('./storage');

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('setupInterceptors', () => {
  const client = {
    instance: {
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }
  } as unknown as Client;

  const navigate = vi.fn();

  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(navigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set up request interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.request.use).toHaveBeenCalledTimes(1);
  });

  it('should add Authorization header to request if token is present', () => {
    const request = { url: '/path3', headers: {} };
    const accessToken = 'token';
    window.localStorage.setItem('ARPU-accessToken', accessToken);
    setupInterceptors(client);
    const requestInterceptor = (client.instance.interceptors.request.use as Mock).mock.calls[0][0];
    const result = requestInterceptor(request);
    expect(result.headers['Authorization']).toBe(`Bearer ${accessToken}`);
  });

  it('should not add Authorization header to request if token is not present', () => {
    window.localStorage.clear();
    const request = { url: '/path3', headers: {} };
    setupInterceptors(client);
    const requestInterceptor = (client.instance.interceptors.request.use as Mock).mock.calls[0][0];
    const result = requestInterceptor(request);
    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('should set up response interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  it('should redirect 401 error', () => {
    const replaceMock = vi.fn();
    const error = { response: { status: 401 } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(global as any, 'window', 'get').mockImplementationOnce(() => ({
      location: {
        replace: replaceMock
      }
    }));

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error);
    expect(storage.user.logOut).toHaveBeenCalledTimes(1);
    expect(replaceMock).toBeCalledWith(ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors['401']));
  });

  it('should emit an error toast notification (403)', () => {
    const error = { response: { status: 403 } };

    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error);

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.403');
  });

  it('should emit an error toast notification (404)', () => {
    const error = { response: { status: 404 } };

    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error);

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.404');
  });

  it('should emit an error toast notification (500)', () => {
    const error = { response: { status: 500 } };

    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error);

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.500');
  });

  it('should emit an error toast notification (default)', () => {
    const error = { response: { status: 418 } };

    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error);

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.default');
  });
});
