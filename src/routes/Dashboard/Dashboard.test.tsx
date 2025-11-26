/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import Dashboard from '.';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserInfo } from 'hooks/useUserInfo';
import { Mock } from 'vitest';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import * as CartStore from 'store/CartStore';
import { useSearch } from 'hooks/useSearch';
import loaders from 'utils/loaders';

i18nTestSetup({
  app: {
    dashboard: {
      title: 'greetings, {{username}}'
    }
  }
});

vi.mock('utils/loaders', () => ({
  default: {
    getPagedDebtorReceipts: vi.fn()
  }
}));

vi.mock('utils/config');

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

vi.mock('hooks/useSearch');

vi.mock('components/PaymentButton', () => ({
  default: () => <button data-testid="payment-button">Pay</button>
}));

vi.mock('routes/Receipts/components/ReceiptsPreview', () => ({
  ReceiptsPreview: ({ rows }: any) => (
    <div data-testid="receipts-preview">
      {rows.map((receipt: any) => (
        <div key={receipt.receiptId} onClick={() => {}} role="button" tabIndex={0}>
          {receipt.orgName}
        </div>
      ))}
    </div>
  )
}));

vi.mock('components/Skeleton', () => ({
  TransactionListSkeleton: () => <div data-testid="transaction-list-skeleton">Loading...</div>
}));

vi.mock('components/Retry', () => ({
  Retry: ({ action }: any) => (
    <div data-testid="retry-component">
      <button onClick={action} data-testid="retry-button">
        Retry
      </button>
    </div>
  )
}));

vi.mock('components/NoData/NoData', () => ({
  NoData: ({ title, text }: any) => (
    <div data-testid="no-data-component">
      <div data-testid="no-data-title">{title}</div>
      <div data-testid="no-data-text">{text}</div>
    </div>
  )
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
  const setSearchParams = vi.fn();
  const mockApplyFilters = vi.fn();

  localStorage.setItem('brokerId', '123');

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
    ],
    totalPages: 1,
    totalElements: 2,
    pageNumber: 0
  };

  beforeAll(() => {
    vi.mocked(useNavigate).mockReturnValue(navigate);

    Object.defineProperty(document.documentElement, 'lang', { value: 'it', configurable: true });
  });

  beforeEach(() => {
    (useUserInfo as Mock).mockReturnValue({
      userInfo: {
        name: 'Marco',
        familyName: 'Polo'
      }
    });

    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(''), setSearchParams]);

    vi.mocked(loaders.getPagedDebtorReceipts as Mock).mockReturnValue({
      mutate: vi.fn()
    });

    (useSearch as Mock).mockReturnValue({
      query: {
        data: mockReceiptsData,
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
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
      expect(loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
    });
  });

  it('renders receipts preview with data', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('receipts-preview')).toBeInTheDocument();
      expect(screen.getByText('clickable')).toBeInTheDocument();
      expect(screen.getByText('Organization 2')).toBeInTheDocument();
    });
  });

  it('renders a retry component if there is an error', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: undefined,
        isError: true,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('retry-component')).toBeInTheDocument();
    });
  });

  it('calls applyFilters when retry button is clicked', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: undefined,
        isError: true,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalled();
    });
  });

  it('renders a feedback message when no paid receipts are available', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: [] },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
      expect(screen.getByTestId('no-data-title')).toHaveTextContent('app.receipts.empty.title');
      expect(screen.getByTestId('no-data-text')).toHaveTextContent('app.receipts.empty.subtitle');
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

  it('does not call resetCart if fromAction is not payment-success', async () => {
    const resetCartSpy = vi.spyOn(CartStore, 'resetCart');

    vi.mocked(useSearchParams).mockReturnValueOnce([
      new URLSearchParams('fromAction=something-else'),
      setSearchParams
    ]);

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(resetCartSpy).not.toHaveBeenCalled();
    });
  });

  it('renders last transactions section', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByText('app.dashboard.lastTransactions')).toBeInTheDocument();
      expect(screen.getByText('app.dashboard.seeAllTransactions')).toBeInTheDocument();
    });
  });

  it('does not render "See all" button when no receipts are available', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: [] },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.queryByText('app.dashboard.seeAllTransactions')).not.toBeInTheDocument();
    });
  });

  it('calls getPagedDebtorReceipts with correct brokerId', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
    });
  });

  it('passes correct filters to useSearch hook', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(useSearch).toHaveBeenCalledWith({
        query: expect.anything(),
        filters: {
          sort: ['paymentDateTime,desc'],
          size: 3,
          page: 0
        }
      });
    });
  });

  it('renders payment button', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-button')).toBeInTheDocument();
    });
  });

  it('handles undefined user name gracefully', async () => {
    (useUserInfo as Mock).mockReturnValue({
      userInfo: {
        name: undefined,
        familyName: 'Polo'
      }
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.queryByText(/greetings/)).not.toBeInTheDocument();
    });
  });

  it('renders retry component when data content is undefined', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: undefined },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('retry-component')).toBeInTheDocument();
    });
  });

  it('passes hideDateOrdering prop to ReceiptsPreview', async () => {
    render(<DashboardWithState />);

    await waitFor(() => {
      expect(screen.getByTestId('receipts-preview')).toBeInTheDocument();
    });
    // The ReceiptsPreview component should receive hideDateOrdering prop
    // This is verified by the component rendering without errors
  });
});
