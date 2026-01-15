/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Mock } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';
import { ReceiptsList } from '.';
import { BrowserRouter } from 'react-router-dom';

const mockReceipts = {
  content: [
    {
      receiptId: 1,
      organizationId: 100,
      iuv: '123456789012345678',
      orgName: 'ACI Automobile Club Italia',
      paymentAmountCents: 53322,
      paymentDateTime: '2024-11-05T10:57:06Z'
    },
    {
      receiptId: 2,
      organizationId: 200,
      iuv: '987654321098765432',
      orgName: 'Comune di Roma',
      paymentAmountCents: 53861,
      paymentDateTime: '2024-11-05T10:43:56Z'
    }
  ],
  totalPages: 2
};

vi.mock('utils', () => ({
  default: {
    loaders: {
      getPagedDebtorReceipts: vi.fn()
    }
  }
}));

vi.mock('hooks/useSearch');

vi.mock('utils/config', () => ({
  default: {
    brokerId: '123'
  }
}));

vi.mock('react-helmet', () => ({
  Helmet: ({ children }: any) => <div>{children}</div>
}));

vi.mock('../components/item', () => ({
  ReceiptItem: ({ receipt }: any) => (
    <div data-testid={`receipt-item-${receipt.receiptId}`}>{receipt.orgName}</div>
  )
}));

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
          <div>{noDataTitle}</div>
          <div>{noDataText}</div>
        </div>
      );
    }
    return <div data-testid="content-component">{children}</div>;
  }
}));

vi.mock('components/PaymentButton', () => ({
  default: () => <button>Make Payment</button>
}));

vi.mock('components/DataGrid/CustomPagination', () => ({
  default: ({ totalPages }: any) => <div data-testid="pagination">Pages: {totalPages}</div>
}));

vi.mock('components/DateRange', () => ({
  DateRange: () => <div data-testid="date-range">Date Range</div>
}));

describe('ReceiptsList', () => {
  const mockApplyFilters = vi.fn();

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({
      mutate: vi.fn()
    });

    (useSearch as Mock).mockReturnValue({
      query: {
        data: mockReceipts,
        isError: false,
        isPending: false,
        isSuccess: true
      },
      applyFilters: mockApplyFilters
    });
  });

  it('renders page title and subtitle', () => {
    renderWithRouter(<ReceiptsList />);

    expect(screen.getByText('menu.receipts.pageTitle')).toBeInTheDocument();
    expect(screen.getByText('app.receipts.subtitle')).toBeInTheDocument();
  });

  it('renders link to receipts search', () => {
    renderWithRouter(<ReceiptsList />);

    const link = screen.getByText('app.receipts.subtitleLink');
    expect(link).toBeInTheDocument();
  });

  it('renders receipt items when data is available', () => {
    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('receipt-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-item-2')).toBeInTheDocument();
  });

  it('renders pagination when totalPages exists', () => {
    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('does not render pagination when totalPages is 0', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { ...mockReceipts, totalPages: 0 },
        isError: false,
        isPending: false,
        isSuccess: true
      },
      applyFilters: mockApplyFilters
    });

    renderWithRouter(<ReceiptsList />);

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('renders search input and filter buttons', () => {
    renderWithRouter(<ReceiptsList />);

    expect(screen.getByLabelText('Codice Avviso')).toBeInTheDocument();
    expect(screen.getByText('actions.filter')).toBeInTheDocument();
    expect(screen.getByText('actions.resetFilters')).toBeInTheDocument();
  });

  it('renders date range component', () => {
    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('date-range')).toBeInTheDocument();
  });

  it('applies filters when filter button is clicked', async () => {
    renderWithRouter(<ReceiptsList />);

    const searchInput = screen.getByLabelText('Codice Avviso');
    fireEvent.change(searchInput, { target: { value: '123456789' } });

    const filterButton = screen.getByText('actions.filter');
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalledWith({
        noticeNumberOrIuv: '123456789'
      });
    });
  });

  it('resets filters when reset button is clicked', async () => {
    renderWithRouter(<ReceiptsList />);

    const searchInput = screen.getByLabelText('Codice Avviso');
    fireEvent.change(searchInput, { target: { value: '123456789' } });

    const resetButton = screen.getByText('actions.resetFilters');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(mockApplyFilters).toHaveBeenCalledWith({});
    });
  });

  it('shows retry component on error', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: undefined,
        isError: true,
        isPending: false,
        isSuccess: false
      },
      applyFilters: mockApplyFilters
    });

    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('retry-component')).toBeInTheDocument();
  });

  it('calls applyFilters when retry is clicked', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: undefined,
        isError: true,
        isPending: false,
        isSuccess: false
      },
      applyFilters: mockApplyFilters
    });

    renderWithRouter(<ReceiptsList />);

    fireEvent.click(screen.getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalled();
    });
  });

  it('shows no data component when content is empty', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: [], totalPages: 0 },
        isError: false,
        isPending: false,
        isSuccess: true
      },
      applyFilters: mockApplyFilters
    });

    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    expect(screen.getByText('app.receipts.empty.title')).toBeInTheDocument();
  });

  it('calls getPagedDebtorReceipts with brokerId', () => {
    renderWithRouter(<ReceiptsList />);

    expect(utils.loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
  });
});
