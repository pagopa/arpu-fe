import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouteGuard, RouteGuardProps, RouteGuardByAvailableRoutes } from './index';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import appStore from 'store/appStore';
import { ROUTES, OUTCOMES } from 'routes/routes';

const FakeGuardedRouter = (props: RouteGuardProps) => (
  <MemoryRouter>
    <Routes>
      <Route path="/recovery-route" element={<p>recovery</p>} />
      <Route path="/" element={<RouteGuard {...props} />} />
    </Routes>
  </MemoryRouter>
);

describe('RouteGuard component', () => {
  it('should redirect to specified route when any required item is missing in storage', () => {
    const redirectTo = '/recovery-route';

    render(
      <FakeGuardedRouter itemKeys={['test']} redirectTo={redirectTo}>
        <p>test</p>
      </FakeGuardedRouter>
    );
    expect(screen.queryByText('recovery')).toBeInTheDocument();
  });

  it('should render children when all required items are in storage', () => {
    const mapStorage = new Map();
    mapStorage.set('test', 1);

    const storage = {
      getItem: (item: string) => mapStorage.get(item)
    };

    render(
      <FakeGuardedRouter itemKeys={['test']} storage={storage as Storage}>
        <p>test</p>
      </FakeGuardedRouter>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should render children when conditionFn returns true', () => {
    const conditionFn = vi.fn(() => true);

    render(
      <FakeGuardedRouter conditionFn={conditionFn}>
        <p>test</p>
      </FakeGuardedRouter>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(conditionFn).toHaveBeenCalled();
  });

  it('should redirect to specified route when conditionFn returns false', () => {
    const redirectTo = '/recovery-route';
    const conditionFn = vi.fn(() => false);

    render(
      <FakeGuardedRouter conditionFn={conditionFn} redirectTo={redirectTo}>
        <p>test</p>
      </FakeGuardedRouter>
    );
    expect(screen.queryByText('recovery')).toBeInTheDocument();
    expect(conditionFn).toHaveBeenCalled();
  });
});

describe('RouteGuardByAvailableRoutes component', () => {
  const REDIRECT_403 = ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['403']);

  const FakeAvailableRoutesRouter = ({
    path,
    children
  }: {
    path: string;
    children: React.ReactNode;
  }) => (
    <MemoryRouter>
      <Routes>
        <Route path={REDIRECT_403} element={<p>forbidden</p>} />
        <Route
          path="/"
          element={
            <RouteGuardByAvailableRoutes path={path}>{children}</RouteGuardByAvailableRoutes>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  beforeEach(() => {
    appStore.value = {
      isReady: true,
      brokerInfo: null,
      brokerCode: 'test-broker'
    };
  });

  it('should render children when availableRoutes is not defined', () => {
    render(
      <FakeAvailableRoutesRouter path="/test-path">
        <p>test</p>
      </FakeAvailableRoutesRouter>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should render children when path is in availableRoutes', () => {
    appStore.value = {
      isReady: true,
      brokerCode: 'test-broker',
      brokerInfo: {
        brokerId: 1,
        externalId: 'test-broker',
        brokerName: 'test-broker',
        brokerFiscalCode: 'test-broker',
        config: {
          translation: {},
          availableRoutes: ['/test-path']
        }
      }
    };

    render(
      <FakeAvailableRoutesRouter path="/test-path">
        <p>test</p>
      </FakeAvailableRoutesRouter>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should redirect to forbidden page when path is NOT in availableRoutes', () => {
    appStore.value = {
      isReady: true,
      brokerCode: 'test-broker',
      brokerInfo: {
        brokerId: 1,
        externalId: 'test-broker',
        brokerName: 'test-broker',
        brokerFiscalCode: 'test-broker',
        config: {
          translation: {},
          availableRoutes: ['/other-path']
        }
      }
    };

    render(
      <FakeAvailableRoutesRouter path="/test-path">
        <p>test</p>
      </FakeAvailableRoutesRouter>
    );
    expect(screen.queryByText('forbidden')).toBeInTheDocument();
  });

  it('should render children when availableRoutes is empty', () => {
    appStore.value = {
      isReady: true,
      brokerCode: 'test-broker',
      brokerInfo: {
        brokerId: 1,
        externalId: 'test-broker',
        brokerName: 'test-broker',
        brokerFiscalCode: 'test-broker',
        config: {
          translation: {},
          availableRoutes: []
        }
      }
    };

    render(
      <FakeAvailableRoutesRouter path="/test-path">
        <p>test</p>
      </FakeAvailableRoutesRouter>
    );
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
