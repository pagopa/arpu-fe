import { setupInterceptors } from './interceptors';
import { Client } from 'models/Client';
import { useNavigate } from 'react-router-dom';
import storage, { StorageItems } from './storage';
import { ROUTES, OUTCOMES } from 'routes/routes';
import { Mock } from 'vitest';
import utils from 'utils';
import { isRecaptchaError } from 'models/ApiErrors';

vi.mock('./storage');

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('models/ApiErrors', () => ({
  isRecaptchaError: vi.fn()
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
  const originalLocation = window.location;

  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(navigate);
    (isRecaptchaError as Mock).mockReturnValue(false);
    (storage.user.isAnonymous as Mock).mockReturnValue(false);

    Object.defineProperty(window, 'location', {
      value: { replace: vi.fn() },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
  });

  it('should set up request interceptor', () => {
    setupInterceptors(client);
    expect(client.instance.interceptors.request.use).toHaveBeenCalledTimes(1);
  });

  it('should add Authorization header to request if token is present', () => {
    const request = { url: '/path3', headers: {} };
    const accessToken = 'token';
    window.localStorage.setItem(StorageItems.TOKEN, accessToken);
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

  it('should redirect public broker lookup errors to broker-not-found and clear broker info', () => {
    const error = {
      response: { status: 401 },
      config: {
        url: '/public/brokers',
        params: { externalId: 'pippo' }
      }
    };

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(storage.app.clearBrokerInfo).toHaveBeenCalledTimes(1);
    expect(storage.user.logOut).not.toHaveBeenCalled();
    expect(window.location.replace).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', 'broker-non-trovato')
    );
  });

  it('should redirect to verifica-non-riuscita on 401 when isRecaptchaError returns true', () => {
    (isRecaptchaError as Mock).mockReturnValue(true);
    const error = { response: { status: 401 } };

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(storage.user.logOut).not.toHaveBeenCalled();
    expect(window.location.replace).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', 'verifica-non-riuscita')
    );
  });

  it('should emit a toast on 401 for anonymous users without logging out or redirecting', () => {
    (storage.user.isAnonymous as Mock).mockReturnValue(true);
    const error = { response: { status: 401 } };
    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.default');
    expect(storage.user.logOut).not.toHaveBeenCalled();
    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it('should redirect 401 error', () => {
    const error = { response: { status: 401 } };

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(storage.user.logOut).toHaveBeenCalledTimes(1);
    expect(window.location.replace).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['401'])
    );
  });

  it('should emit an error toast notification (403)', () => {
    const error = { response: { status: 403 } };
    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.403');
  });

  it('should emit an error toast notification (404)', () => {
    const error = { response: { status: 404 } };
    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.404');
  });

  it('should emit an error toast notification (500)', () => {
    const error = { response: { status: 500 } };
    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.500');
  });

  it('should emit an error toast notification (default)', () => {
    const error = { response: { status: 418 } };
    const notifyEmitMock = vi.spyOn(utils.notify, 'emit');

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];
    responseInterceptor(error).catch(() => {});

    expect(notifyEmitMock).toHaveBeenCalledWith('errors.toast.default');
  });

  it('should reject the promise on 401', async () => {
    const error = { response: { status: 401 } };

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];

    await expect(responseInterceptor(error)).rejects.toEqual(error);
  });

  it('should reject the promise on toast errors too', async () => {
    const error = { response: { status: 500 } };

    setupInterceptors(client);
    const responseInterceptor = (client.instance.interceptors.response.use as Mock).mock
      .calls[0][1];

    await expect(responseInterceptor(error)).rejects.toEqual(error);
  });
});
