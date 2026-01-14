/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '.';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Mock } from 'vitest';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useUserInfo } from 'hooks/useUserInfo';

i18nTestSetup({
  app: {
    dashboard: {
      title: 'greetings, {{username}}'
    }
  }
});

vi.mock('hooks/useUserInfo', () => ({
  useUserInfo: vi.fn()
}));

vi.mock('components/PaymentButton', () => ({
  default: () => <button data-testid="payment-button">Pay</button>
}));

vi.mock('./components/Receipts', () => ({
  Receipts: () => <div data-testid="receipts-component">Receipts</div>
}));

vi.mock('./components/DebtPositions', () => ({
  DebtPositions: () => <div data-testid="debt-positions-component">Debt Positions</div>
}));

describe('Dashboard', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    (useUserInfo as Mock).mockReturnValue({
      userInfo: {
        name: 'Marco'
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders all components', () => {
    renderDashboard();

    expect(screen.getByTestId('payment-button')).toBeInTheDocument();
    expect(screen.getByTestId('receipts-component')).toBeInTheDocument();
    expect(screen.getByTestId('debt-positions-component')).toBeInTheDocument();
  });

  it('displays capitalized username in greeting', () => {
    renderDashboard();

    expect(screen.getByText('greetings, Marco')).toBeInTheDocument();
  });

  it('handles undefined username', () => {
    (useUserInfo as Mock).mockReturnValue({
      userInfo: {
        name: undefined
      }
    });

    renderDashboard();

    expect(screen.queryByText(/greetings/)).not.toBeInTheDocument();
  });
});
