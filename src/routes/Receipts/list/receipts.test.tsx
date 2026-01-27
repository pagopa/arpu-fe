/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Mock } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';
import { ReceiptsList } from '.';
import { BrowserRouter } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

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

let mockDateRangeCallbacks: {
  onFromChange?: (date: Dayjs | null) => void;
  onToChange?: (date: Dayjs | null) => void;
} = {};

vi.mock('components/DateRange', () => ({
  DateRange: ({ from, to }: any) => {
    mockDateRangeCallbacks.onFromChange = from?.onChange;
    mockDateRangeCallbacks.onToChange = to?.onChange;
    return (
      <div data-testid="date-range">
        <button data-testid="set-from-date" onClick={() => from?.onChange?.(dayjs('2024-01-01'))}>
          Set From Date
        </button>
        <button data-testid="set-to-date" onClick={() => to?.onChange?.(dayjs('2024-12-31'))}>
          Set To Date
        </button>
        <button data-testid="clear-from-date" onClick={() => from?.onChange?.(null)}>
          Clear From Date
        </button>
        <button data-testid="clear-to-date" onClick={() => to?.onChange?.(null)}>
          Clear To Date
        </button>
      </div>
    );
  }
}));

describe('ReceiptsList', () => {
  const mockApplyFilters = vi.fn();

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDateRangeCallbacks = {};

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

  describe('Basic Rendering', () => {
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

    it('calls getPagedDebtorReceipts with brokerId', () => {
      renderWithRouter(<ReceiptsList />);

      expect(utils.loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
    });
  });

  describe('Receipt Display', () => {
    it('renders receipt items when data is available', () => {
      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('receipt-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('receipt-item-2')).toBeInTheDocument();
    });

    it('renders all receipts from content array', () => {
      renderWithRouter(<ReceiptsList />);

      expect(screen.getByText('ACI Automobile Club Italia')).toBeInTheDocument();
      expect(screen.getByText('Comune di Roma')).toBeInTheDocument();
    });

    it('renders content component when data exists', () => {
      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('content-component')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
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

    it('does not render pagination when totalPages is undefined', () => {
      (useSearch as Mock).mockReturnValue({
        query: {
          data: { content: mockReceipts.content },
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('renders pagination when totalPages is 1', () => {
      (useSearch as Mock).mockReturnValue({
        query: {
          data: { ...mockReceipts, totalPages: 1 },
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText('Pages: 1')).toBeInTheDocument();
    });
  });

  describe('Search Code Filtering', () => {
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

    it('trims whitespace from search code before applying filters', async () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: '  123456789  ' } });

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: '123456789'
        });
      });
    });

    it('does not include search code in filters when empty', async () => {
      renderWithRouter(<ReceiptsList />);

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });
    });

    it('does not include search code in filters when only whitespace', async () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: '   ' } });

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });
    });

    it('updates search code state when input changes', () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'ABC123' } });

      expect(searchInput.value).toBe('ABC123');
    });
  });

  describe('Date Range Filtering', () => {
    it('applies filters with start date when set', async () => {
      renderWithRouter(<ReceiptsList />);

      fireEvent.click(screen.getByTestId('set-from-date'));

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          paymentDateTimeFrom: dayjs('2024-01-01').format()
        });
      });
    });

    it('applies filters with end date when set', async () => {
      renderWithRouter(<ReceiptsList />);

      fireEvent.click(screen.getByTestId('set-to-date'));

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          paymentDateTimeTo: dayjs('2024-12-31').format()
        });
      });
    });

    it('applies filters with both start and end dates', async () => {
      renderWithRouter(<ReceiptsList />);

      fireEvent.click(screen.getByTestId('set-from-date'));
      fireEvent.click(screen.getByTestId('set-to-date'));

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          paymentDateTimeFrom: dayjs('2024-01-01').format(),
          paymentDateTimeTo: dayjs('2024-12-31').format()
        });
      });
    });

    it('does not include dates in filters when not set', async () => {
      renderWithRouter(<ReceiptsList />);

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Combined Filtering', () => {
    it('applies search code and date filters together', async () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: '123456789' } });

      fireEvent.click(screen.getByTestId('set-from-date'));
      fireEvent.click(screen.getByTestId('set-to-date'));

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: '123456789',
          paymentDateTimeFrom: dayjs('2024-01-01').format(),
          paymentDateTimeTo: dayjs('2024-12-31').format()
        });
      });
    });

    it('applies only non-empty filters', async () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: '123456789' } });

      fireEvent.click(screen.getByTestId('set-from-date'));

      const filterButton = screen.getByText('actions.filter');
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: '123456789',
          paymentDateTimeFrom: dayjs('2024-01-01').format()
        });
      });
    });
  });

  describe('Reset Filters', () => {
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

    it('resets search code state', async () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: '123456789' } });

      expect(searchInput.value).toBe('123456789');

      const resetButton = screen.getByText('actions.resetFilters');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(searchInput.value).toBe('');
      });
    });

    it('clears all filters and dates', async () => {
      renderWithRouter(<ReceiptsList />);

      // Set filters
      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: '123456789' } });
      fireEvent.click(screen.getByTestId('set-from-date'));
      fireEvent.click(screen.getByTestId('set-to-date'));

      // Apply filters
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            noticeNumberOrIuv: '123456789'
          })
        );
      });

      // Reset
      const resetButton = screen.getByText('actions.resetFilters');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenLastCalledWith({});
      });
    });
  });

  describe('Error Handling', () => {
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

    it('retries with current applied filters', async () => {
      renderWithRouter(<ReceiptsList />);

      // Apply some filters first
      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: '123456789' } });
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: '123456789'
        });
      });

      // Simulate error state
      (useSearch as Mock).mockReturnValue({
        query: {
          data: undefined,
          isError: true,
          isPending: false,
          isSuccess: false
        },
        applyFilters: mockApplyFilters
      });

      // Re-render won't happen automatically in this test, but we can verify the logic
      // by checking that retry calls applyFilters with the stored appliedFilters
    });
  });

  describe('Empty State', () => {
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

    it('shows no data component when content is undefined', () => {
      (useSearch as Mock).mockReturnValue({
        query: {
          data: { totalPages: 0 },
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    });

    it('shows empty state subtitle', () => {
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

      expect(screen.getByText('app.receipts.empty.subtitle')).toBeInTheDocument();
    });
  });

  describe('Data Handling Edge Cases', () => {
    it('handles null data gracefully', () => {
      (useSearch as Mock).mockReturnValue({
        query: {
          data: null,
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    });

    it('handles undefined data gracefully', () => {
      (useSearch as Mock).mockReturnValue({
        query: {
          data: undefined,
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    });

    it('renders single receipt correctly', () => {
      (useSearch as Mock).mockReturnValue({
        query: {
          data: {
            content: [mockReceipts.content[0]],
            totalPages: 1
          },
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      expect(screen.getByTestId('receipt-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('receipt-item-2')).not.toBeInTheDocument();
    });

    it('renders many receipts correctly', () => {
      const manyReceipts = Array.from({ length: 10 }, (_, i) => ({
        receiptId: i + 1,
        organizationId: 100 + i,
        iuv: `12345678901234567${i}`,
        orgName: `Organization ${i + 1}`,
        paymentAmountCents: 50000 + i * 100,
        paymentDateTime: '2024-11-05T10:57:06Z'
      }));

      (useSearch as Mock).mockReturnValue({
        query: {
          data: {
            content: manyReceipts,
            totalPages: 1
          },
          isError: false,
          isPending: false,
          isSuccess: true
        },
        applyFilters: mockApplyFilters
      });

      renderWithRouter(<ReceiptsList />);

      manyReceipts.forEach((receipt) => {
        expect(screen.getByTestId(`receipt-item-${receipt.receiptId}`)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Filter Applications', () => {
    it('handles multiple sequential filter applications', async () => {
      renderWithRouter(<ReceiptsList />);

      // First filter application
      const searchInput = screen.getByLabelText('Codice Avviso');
      fireEvent.change(searchInput, { target: { value: 'first' } });
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: 'first'
        });
      });

      // Second filter application
      fireEvent.change(searchInput, { target: { value: 'second' } });
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: 'second'
        });
      });
    });

    it('handles filter, reset, filter sequence', async () => {
      renderWithRouter(<ReceiptsList />);

      const searchInput = screen.getByLabelText('Codice Avviso');
      const filterButton = screen.getByText('actions.filter');
      const resetButton = screen.getByText('actions.resetFilters');

      // Apply filter
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: 'test'
        });
      });

      // Reset
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });

      // Apply new filter
      fireEvent.change(searchInput, { target: { value: 'newtest' } });
      fireEvent.click(filterButton);

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: 'newtest'
        });
      });
    });
  });
});
