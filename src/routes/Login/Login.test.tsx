/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Login from '.';
import '@testing-library/jest-dom';
import utils from 'utils';
import { ArcRoutes } from 'routes/routes';
import { useNavigate } from 'react-router-dom';
import { Mock } from 'vitest';

describe('LoginRoute', () => {
  const mockNavigate = vi.fn();
  const replaceSpy = vi.fn();

  Object.defineProperty(window, 'location', {
    value: { replace: replaceSpy }
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

  it('redirects to the Dashboard', async () => {
    vi.spyOn(utils.storage.user, 'hasToken').mockImplementation(() => true);
    vi.spyOn(utils.storage.user, 'hasToken').mockImplementation(() => true);
    render(<Login />);
    expect(mockNavigate).toBeCalledWith(ArcRoutes.DASHBOARD);
  });
});
