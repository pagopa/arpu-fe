/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import { Receipts } from './Receipts';
import { Mock, vi } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';

// Mock utils
vi.mock('utils', () => ({
  default: {
    storage: {
      app: {
        getBrokerId: vi.fn()
      }
    },
    loaders: {
      getPagedDebtorReceipts: vi.fn()
    }
  }
}));

// Mock useSearch
vi.mock('hooks/useSearch');

// Mock Content component
vi.mock('components/Content', () => ({
  Content: ({ children, showRetry, noData, onRetry, noDataTitle, noDataText }: any) => {
    if (showRetry) {
      return (
        <div data-testid="retry-component">
          <button onClick={onRetry} data-testid="retry-button">
            Retry
          </button>
        </div>
      );
    }
    if (noData) {
      return (
        <div data-testid="no-data-component">
          <div data-testid="no-data-title">{noDataTitle}</div>
          <div data-testid="no-data-text">{noDataText}</div>
        </div>
      );
    }
    return <div data-testid="content-component">{children}</div>;
  }
}));

// Mock ReceiptItem component
vi.mock('routes/Receipts/components/item', () => ({
  ReceiptItem: ({ receipt }: any) => (
    <div data-testid={`receipt-item-${receipt.receiptId}`}>
      <span data-testid="receipt-org-name">{receipt.orgName}</span>
      <span data-testid="receipt-iuv">{receipt.iuv}</span>
    </div>
  )
}));

// Mock react-router-dom Link
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    )
  };
});

// Mock routes
vi.mock('routes/routes', () => ({
  ArcRoutes: {
    RECEIPTS: '/receipts'
  }
}));

describe('Receipts component', () => {
  const mockApplyFilters = vi.fn();
  const mockReceiptsData = {
    content: [
      {
        receiptId: 1,
        organizationId: 100,
        iuv: '123456789012345678',
        paymentDateTime: '2024-01-15T10:30:00Z',
        paymentAmountCents: 50000,
        orgName: 'Organization 1',
        debtor: {
          fiscalCode: 'RSSMRA80A01H501U',
          fullName: 'Mario Rossi'
        }
      },
      {
        receiptId: 2,
        organizationId: 200,
        iuv: '987654321098765432',
        paymentDateTime: '2024-01-14T14:20:00Z',
        paymentAmountCents: 75000,
        orgName: 'Organization 2',
        debtor: {
          fiscalCode: 'VRDLGI85M01H501Z',
          fullName: 'Luigi Verdi'
        }
      },
      {
        receiptId: 3,
        organizationId: 300,
        iuv: '111222333444555666',
        paymentDateTime: '2024-01-13T09:15:00Z',
        paymentAmountCents: 25000,
        orgName: 'Organization 3',
        debtor: {
          fiscalCode: 'BNCGVN90A01H501W',
          fullName: 'Giovanni Bianchi'
        }
      }
    ],
    totalElements: 3,
    totalPages: 1,
    number: 0,
    size: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(utils.storage.app, 'getBrokerId').mockReturnValue(123);
    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({
      queryKey: ['pagedDebtorReceipts', 123],
      queryFn: vi.fn()
    });

    (useSearch as unknown as Mock).mockReturnValue({
      query: {
        data: mockReceiptsData,
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });
  });

  it('renders with title and receipt items when data exists', () => {
    render(<Receipts />);

    expect(screen.getByText('app.dashboard.lastTransactions')).toBeInTheDocument();
    expect(screen.getByText('app.dashboard.seeAllTransactions')).toBeInTheDocument();
    expect(screen.getByTestId('content-component')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-item-3')).toBeInTheDocument();
  });

  it('renders correct number of receipt items', () => {
    render(<Receipts />);

    const receiptItems = screen.getAllByTestId(/^receipt-item-/);
    expect(receiptItems).toHaveLength(3);
  });

  it('passes correct receipt data to ReceiptItem components', () => {
    render(<Receipts />);

    expect(screen.getByTestId('receipt-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-item-3')).toBeInTheDocument();
  });

  it('does not show "See All Transactions" button when no receipts', () => {
    (useSearch as unknown as Mock).mockReturnValueOnce({
      query: {
        data: { content: [] },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<Receipts />);
    expect(screen.queryByText('app.dashboard.seeAllTransactions')).not.toBeInTheDocument();
  });

  it('does not show "See All Transactions" button when content is undefined', () => {
    (useSearch as unknown as Mock).mockReturnValueOnce({
      query: {
        data: undefined,
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<Receipts />);
    expect(screen.queryByText('app.dashboard.seeAllTransactions')).not.toBeInTheDocument();
  });

  it('renders link to receipts page with correct route', () => {
    render(<Receipts />);

    const link = screen.getByText('app.dashboard.seeAllTransactions').closest('a');
    expect(link).toHaveAttribute('href', '/receipts');
  });

  it('shows retry component when query has error', () => {
    (useSearch as unknown as Mock).mockReturnValueOnce({
      query: {
        data: undefined,
        isError: true,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<Receipts />);

    expect(screen.getByTestId('retry-component')).toBeInTheDocument();
    expect(screen.queryByTestId('content-component')).not.toBeInTheDocument();
  });

  it('calls applyFilters with correct filters when retry clicked', async () => {
    (useSearch as unknown as Mock).mockReturnValueOnce({
      query: {
        data: undefined,
        isError: true,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<Receipts />);

    fireEvent.click(screen.getByTestId('retry-button'));
    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalledWith({
        sort: ['paymentDateTime,desc'],
        size: 3,
        page: 0
      });
    });
  });

  it('shows no data component when content is empty', () => {
    (useSearch as unknown as Mock).mockReturnValueOnce({
      query: {
        data: { content: [] },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<Receipts />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    expect(screen.getByTestId('no-data-title')).toHaveTextContent('app.receipts.empty.title');
    expect(screen.getByTestId('no-data-text')).toHaveTextContent('app.receipts.empty.subtitle');
  });

  it('shows no data component when data is undefined', () => {
    (useSearch as unknown as Mock).mockReturnValueOnce({
      query: {
        data: undefined,
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<Receipts />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
  });

  it('calls getBrokerId to retrieve broker ID', () => {
    render(<Receipts />);

    expect(utils.storage.app.getBrokerId).toHaveBeenCalled();
  });

  it('calls getPagedDebtorReceipts with broker ID', () => {
    render(<Receipts />);

    expect(utils.loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
  });

  it('initializes useSearch with correct filters', () => {
    render(<Receipts />);

    expect(useSearch).toHaveBeenCalledWith({
      query: expect.any(Object),
      filters: {
        sort: ['paymentDateTime,desc'],
        size: 3,
        page: 0
      }
    });
  });

  it('renders title with correct translation key', () => {
    render(<Receipts />);

    expect(screen.getByText('app.dashboard.lastTransactions')).toBeInTheDocument();
  });

  it('passes correct props to Content component', () => {
    render(<Receipts />);

    expect(screen.getByTestId('content-component')).toBeInTheDocument();
  });
});
