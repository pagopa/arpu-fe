import utils from 'utils';
import { Client } from 'models/Client';
import { OUTCOMES, ROUTES } from 'routes/routes';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { t } from 'i18next';
import { StorageItems } from './storage';

const isPublicBrokerInfoRequest = (error: AxiosError) =>
  error.config?.url === '/public/brokers' && Boolean(error.config?.params?.externalId);

export const setupInterceptors = (client: Client) => {
  client.instance.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
      const tokenHeaderExcludePaths: string[] = utils.config.tokenHeaderExcludePaths;
      const routeUrl = request.url || '';
      const accessToken = window.localStorage.getItem(StorageItems.TOKEN);
      if (accessToken && !tokenHeaderExcludePaths.includes(routeUrl)) {
        request.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return request;
    },
    (error: Promise<AxiosError>) => {
      return Promise.reject(error);
    }
  );
  client.instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isPublicBrokerInfoRequest(error)) {
        const toUrl = ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['410']);
        utils.storage.app.clearBrokerInfo();
        window.location.replace(toUrl);
      } else if (error.response?.status === 401) {
        const isPublicRequest = error.config?.url?.includes('/public/');
        if (isPublicRequest) {
          return Promise.reject(error);
        }
        const toUrl = ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['401']);
        utils.storage.user.logOut();
        window.location.replace(toUrl);
      } else if (error.response?.status === 403) {
        utils.notify.emit(t('errors.toast.403'));
      } else if (error.response?.status === 404) {
        utils.notify.emit(t('errors.toast.404'));
      } else if ((error.response?.status ?? 0) >= 500) {
        utils.notify.emit(t('errors.toast.500'));
      } else {
        utils.notify.emit(t('errors.toast.default'));
      }
    }
  );
};
