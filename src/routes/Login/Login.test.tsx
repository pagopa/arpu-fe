import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Login from '.';
import '@testing-library/jest-dom';
import utils from 'utils';
import { ArcRoutes } from 'routes/routes';

describe('LoginRoute', () => {
  const replaceSpy = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { replace: replaceSpy }
  });

  it('renders nothing without crashing', async () => {
    render(<Login />);
  });

  it('redirects to OI', async () => {
    render(<Login />);
    const logInButton = screen.getByTestId('logInButton');
    fireEvent.click(logInButton);
    expect(replaceSpy).toBeCalledWith(utils.config.loginUrl);
  });

  it('redirects to the Dashboard', async () => {
    vi.spyOn(utils.storage.user, 'hasToken').mockImplementation(() => true);
    render(<Login />);
    expect(replaceSpy).toBeCalledWith(ArcRoutes.DASHBOARD);
  });
});
