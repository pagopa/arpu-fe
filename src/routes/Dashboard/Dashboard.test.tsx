/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import Dashboard from '.';
import '@testing-library/jest-dom';
import { useStore } from 'store/GlobalStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserInfo } from 'hooks/useUserInfo';
import loaders from 'utils/loaders';
import storage from 'utils/storage';
import { Mock } from 'vitest';
import { Signal } from '@preact/signals-react';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import * as CartStore from 'store/CartStore';
import config from 'utils/config';

i18nTestSetup({
  app: {
    dashboard: {
      title: 'greetings, {{username}}',
      greeting: 'Dashboard greeting',
      lastTransactions: 'Last Transactions',
      seeAllTransactions: 'See all'
    },
    paymentNotice: {
      preview: {
        title: 'notice preview title'
      }
    }
  },
  pageTitles: {
    dashboard: 'Dashboard'
  }
});

vi.mock('utils/loaders');
vi.mock('utils/config');

vi.mock('store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>
  };
});

vi.mock('hooks/useUserInfo', () => ({
  useUserInfo: vi.fn()
}));

describe('DashboardRoute', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });
  const navigate = vi.fn();
  const setState = vi.fn();
  const setSearchParams = vi.fn();

  const mockReceiptsData = {
    content: [
      {
        receiptId: 1,
        organizationId: 100,
        orgFiscalCode: '12345678901',
        orgName: 'clickable',
        paymentAmountCents: 10000,
        paymentDateTime: '2024-01-15T10:30:00Z',
        receiptOrigin: 'PAYMENT_NOTICE' as any,
        installmentId: 1,
        remittanceInformation: 'Payment 1',
        debtPositionTypeOrgDescription: 'Org debt type 1',
        debtPositionTypeDescription: 'Debt type 1',
        serviceType: 'Standard'
      },
      {
        receiptId: 2,
        organizationId: 101,
        orgFiscalCode: '12345678902',
        orgName: 'Organization 2',
        paymentAmountCents: 20000,
        paymentDateTime: '2024-01-16T11:30:00Z',
        receiptOrigin: 'PAYMENT_NOTICE' as any,
        installmentId: 2,
        remittanceInformation: 'Payment 2',
        debtPositionTypeOrgDescription: 'Org debt type 2',
        debtPositionTypeDescription: 'Debt type 2',
        serviceType: 'Standard'
      }
    ]
  };

  beforeAll(() => {
    vi.mocked(useNavigate).mockReturnValue(navigate);

    Object.defineProperty(document.documentElement, 'lang', { value: 'it', configurable: true });
  });

  beforeEach(() => {
    (useStore as Mock).mockReturnValue({ setState });
    (useUserInfo as Mock).mockReturnValue({
      userInfo: {
        name: 'Marco',
        familyName: 'Polo'
      }
    });

    vi.mocked(config).brokerId = '123';
    vi.mocked(config).showNotices = true;

    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(''), setSearchParams]);

    vi.mocked(loaders.getLastReceipts as Mock).mockReturnValue({
      data: mockReceiptsData,
      isError: false,
      refetch: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  const DashboardWithState = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Dashboard />
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  it('renders without crashing', async () => {
    render(<DashboardWithState />);
    await waitFor(() => {
      expect(loaders.getLastReceipts).toHaveBeenCalledWith(123);
    });
  });

  it('redirects to transaction detail page', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByText('clickable')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('clickable'));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalled();
    });
  });

  it('renders a retry page if there is an error', async () => {
    (loaders.getLastReceipts as Mock).mockReturnValueOnce({
      data: undefined,
      isError: true,
      refetch: vi.fn()
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
    });
  });

  it('renders a feedback message when no paid notices are available', async () => {
    (loaders.getLastReceipts as Mock).mockReturnValueOnce({
      data: { content: [] },
      isError: false,
      refetch: vi.fn()
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('paid.notices.empty.title')).toBeInTheDocument();
    });
  });

  it('shows the payment notice when opt-in is not set', async () => {
    vi.spyOn(storage.pullPaymentsOptIn, 'get').mockReturnValueOnce({
      value: false
    } as unknown as Signal<boolean>);

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByText('notice preview title')).toBeInTheDocument();
    });
  });

  it('displays correct user info in the dashboard title', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByText('greetings, Marco')).toBeInTheDocument();
    });
  });

  it('calls resetCart if the fromAction query parameter is payment-success', async () => {
    const resetCartSpy = vi.spyOn(CartStore, 'resetCart');

    vi.mocked(useSearchParams).mockReturnValueOnce([
      new URLSearchParams('fromAction=payment-success'),
      setSearchParams
    ]);

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(resetCartSpy).toHaveBeenCalled();
      expect(setSearchParams).toHaveBeenCalledWith({}, { replace: true });
    });
  });

  it('renders last transactions section', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByText('Last Transactions')).toBeInTheDocument();
      expect(screen.getByText('See all')).toBeInTheDocument();
    });
  });

  it('calls getLastReceipts with correct brokerId', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(loaders.getLastReceipts).toHaveBeenCalledWith(123);
    });
  });
});
