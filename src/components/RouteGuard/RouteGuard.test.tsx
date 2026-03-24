import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouteGuard, RouteGuardProps } from './index';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

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
