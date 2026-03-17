/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExternalRoutes, ROUTES } from 'routes/routes';
import appStore from 'store/appStore';
import { useAppRoutes } from './useAppRoutes';

vi.mock('routes/routes', () => ({
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    public: { SOME_ROUTE: '/public/some-route' }
  },
  ExternalRoutes: { SOME_EXTERNAL: 'https://external.com' }
}));

vi.mock('store/appStore', () => ({
  default: { value: { brokerInfo: null } }
}));

describe('useAppRoutes', () => {
  beforeEach(() => {
    appStore.value = { brokerInfo: null } as any;
  });

  it('returns default ROUTES when brokerInfo is null', () => {
    const { result } = renderHook(() => useAppRoutes());

    expect(result.current.routes.LOGIN).toBe(ROUTES.LOGIN);
    expect(result.current.externalRoutes).toBe(ExternalRoutes);
  });

  it('returns default ROUTES when config has no externalLoginUrl', () => {
    appStore.value = {
      brokerInfo: { config: { useCart: false, translation: {} } }
    } as any;

    const { result } = renderHook(() => useAppRoutes());

    expect(result.current.routes.LOGIN).toBe(ROUTES.LOGIN);
  });

  it('overrides LOGIN when externalLoginUrl is present', () => {
    const externalLoginUrl = 'https://broker.com/login';
    appStore.value = {
      brokerInfo: { config: { externalLoginUrl } }
    } as any;

    const { result } = renderHook(() => useAppRoutes());

    expect(result.current.routes.LOGIN).toBe(externalLoginUrl);
  });

  it('preserves public routes', () => {
    const { result } = renderHook(() => useAppRoutes());

    expect(result.current.routes.public).toEqual(ROUTES.public);
  });
});
