/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Mock } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import dayjs from 'dayjs';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';
import { ReceiptsList } from '.';

// Mock data
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

// Mocks
vi.mock('utils', () => ({
  default: {
    loaders: {
      getPagedDebtorReceipts: vi.fn()
    },
    URI: {
      decode: vi.fn(() => ({}))
    }
  }
}));

vi.mock('hooks/useSearch');
vi.mock('utils/config', () => ({ default: { brokerId: '123' } }));
vi.mock('react-helmet', () => ({ Helmet: ({ children }: any) => <div>{children}</div> }));
vi.mock('../components/item', () => ({
  ReceiptItem: ({ receipt }: any) => (
    <div data-testid={`receipt-${receipt.receiptId}`}>{receipt.orgName}</div>
  )
}));
vi.mock('components/Content', () => ({
  Content: ({ children, showRetry, noData, onRetry, noDataTitle }: any) => {
    if (showRetry)
      return (
        <button onClick={onRetry} data-testid="retry-btn">
          Retry
        </button>
      );
    if (noData) return <div data-testid="no-data">{noDataTitle}</div>;
    return <div data-testid="content">{children}</div>;
  }
}));
vi.mock('components/PaymentButton', () => ({ default: () => <button>Pay</button> }));
vi.mock('components/DataGrid/CustomPagination', () => ({
  default: ({ totalPages }: any) => <div data-testid="pagination">Pages: {totalPages}</div>
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let dateCallbacks: any = {};
vi.mock('components/DateRange', () => ({
  DateRange: ({ from, to }: any) => {
    dateCallbacks = { setFrom: from?.onChange, setTo: to?.onChange };
    return (
      <div data-testid="date-range">
        <button onClick={() => from?.onChange?.(dayjs('2024-01-01'))}>Set From</button>
        <button onClick={() => to?.onChange?.(dayjs('2024-12-31'))}>Set To</button>
        <button onClick={() => from?.onChange?.(null)}>Clear From</button>
      </div>
    );
  }
}));

// Test helpers
const renderComponent = () =>
  render(
    <BrowserRouter>
      <ReceiptsList />
    </BrowserRouter>
  );

const setupSearch = (overrides = {}) => {
  (useSearch as Mock).mockReturnValue({
    query: {
      data: mockReceipts,
      isError: false,
      isSuccess: true,
      ...overrides
    },
    applyFilters: vi.fn()
  });
};

describe('ReceiptsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dateCallbacks = {};
    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({ mutate: vi.fn() });
    setupSearch();
  });

  describe('Rendering', () => {
    it('renders page header and filters', () => {
      renderComponent();

      expect(screen.getByText('menu.receipts.pageTitle')).toBeInTheDocument();
      expect(screen.getByLabelText('Codice Avviso')).toBeInTheDocument();
      expect(screen.getByText('actions.filter')).toBeInTheDocument();
      expect(screen.getByText('actions.resetFilters')).toBeInTheDocument();
      expect(screen.getByTestId('date-range')).toBeInTheDocument();
    });

    it('renders receipts when data is available', () => {
      renderComponent();

      expect(screen.getByTestId('receipt-1')).toBeInTheDocument();
      expect(screen.getByTestId('receipt-2')).toBeInTheDocument();
      expect(screen.getByText('ACI Automobile Club Italia')).toBeInTheDocument();
    });

    it('renders pagination when totalPages > 0', () => {
      renderComponent();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('does not render pagination when totalPages is 0', () => {
      setupSearch({ data: { ...mockReceipts, totalPages: 0 } });
      renderComponent();
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('applies search code filter', async () => {
      const mockApplyFilters = vi.fn();
      setupSearch();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      renderComponent();

      fireEvent.change(screen.getByLabelText('Codice Avviso'), {
        target: { value: '  123456789  ' }
      });
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: '123456789'
        });
      });
    });

    it('applies date filters', async () => {
      const mockApplyFilters = vi.fn();
      setupSearch();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      renderComponent();

      fireEvent.click(screen.getByText('Set From'));
      fireEvent.click(screen.getByText('Set To'));
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          paymentDateTimeFrom: dayjs('2024-01-01').format(),
          paymentDateTimeTo: dayjs('2024-12-31').format()
        });
      });
    });

    it('applies combined filters', async () => {
      const mockApplyFilters = vi.fn();
      setupSearch();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      renderComponent();

      fireEvent.change(screen.getByLabelText('Codice Avviso'), {
        target: { value: 'ABC123' }
      });
      fireEvent.click(screen.getByText('Set From'));
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          noticeNumberOrIuv: 'ABC123',
          paymentDateTimeFrom: dayjs('2024-01-01').format()
        });
      });
    });

    it('ignores empty filters', async () => {
      const mockApplyFilters = vi.fn();
      setupSearch();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      renderComponent();

      fireEvent.change(screen.getByLabelText('Codice Avviso'), {
        target: { value: '   ' }
      });
      fireEvent.click(screen.getByText('actions.filter'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Reset', () => {
    it('clears all filters', async () => {
      const mockApplyFilters = vi.fn();
      setupSearch();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      renderComponent();

      const searchInput = screen.getByLabelText('Codice Avviso') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: '123' } });
      fireEvent.click(screen.getByText('Set From'));

      fireEvent.click(screen.getByText('actions.resetFilters'));

      await waitFor(() => {
        expect(searchInput.value).toBe('');
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });
    });
  });

  describe('Error and Empty States', () => {
    it('shows retry on error', () => {
      setupSearch({ data: undefined, isError: true, isSuccess: false });
      renderComponent();
      expect(screen.getByTestId('retry-btn')).toBeInTheDocument();
    });

    it('retries with current filters on retry click', async () => {
      const mockApplyFilters = vi.fn();
      setupSearch({ data: undefined, isError: true, isSuccess: false });
      (useSearch as Mock).mockReturnValue({
        query: { data: undefined, isError: true, isSuccess: false },
        applyFilters: mockApplyFilters
      });

      renderComponent();
      fireEvent.click(screen.getByTestId('retry-btn'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalled();
      });
    });

    it('shows empty state when no data', () => {
      setupSearch({ data: { content: [], totalPages: 0 } });
      renderComponent();
      expect(screen.getByTestId('no-data')).toBeInTheDocument();
      expect(screen.getByText('app.receipts.empty.title')).toBeInTheDocument();
    });
  });
});
