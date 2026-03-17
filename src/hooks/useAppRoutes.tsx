import { useComputed } from '@preact/signals-react';
import { ExternalRoutes, ROUTES } from 'routes/routes';
import appStore from 'store/appStore';

export const useAppRoutes = () =>
  useComputed(() => {
    const config = appStore.value.brokerInfo?.config;

    return {
      externalRoutes: ExternalRoutes,
      routes: {
        ...ROUTES,
        ...(config?.externalLoginUrl && { LOGIN: config.externalLoginUrl }),
        public: { ...ROUTES.public }
      }
    };
  }).value;
