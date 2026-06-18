/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Login from '.';
import '@testing-library/jest-dom';
import utils from 'utils';
import { ROUTES } from 'routes/routes';
import { useNavigate } from 'react-router-dom';
import { Mock } from 'vitest';

describe('LoginRoute', () => {
  const mockNavigate = vi.fn();
  const replaceSpy = vi.fn();

  Object.defineProperty(window, 'location', {
    value: { replace: replaceSpy, pathname: '/cittadini/cie/accesso' },
    writable: true
  });

  vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn()
  }));

  beforeAll(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  beforeEach(() => {
    vi.spyOn(utils.storage.app, 'getBrokerId').mockImplementation(() => 1);
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

  it('pins the brokerCode from the URL before redirecting to OI', async () => {
    const setBrokerCodeSpy = vi.spyOn(utils.storage.app, 'setBrokerCode');
    render(<Login />);
    fireEvent.click(screen.getByTestId('logInButton'));
    expect(setBrokerCodeSpy).toHaveBeenCalledWith('cie');
    expect(replaceSpy).toBeCalledWith(utils.config.loginUrl);
    setBrokerCodeSpy.mockRestore();
  });

  it('redirects to the Dashboard', async () => {
    vi.spyOn(utils.storage.user, 'hasToken').mockImplementation(() => true);
    vi.spyOn(utils.storage.user, 'hasToken').mockImplementation(() => true);
    render(<Login />);
    expect(mockNavigate).toBeCalledWith(ROUTES.DASHBOARD);
  });
});
