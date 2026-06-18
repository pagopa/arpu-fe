/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import '@testing-library/jest-dom';
import { vi, Mock, describe, it, expect, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';
import { screen, fireEvent, waitFor, render } from '__tests__/renderers';
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
    loaders: { getPagedDebtorReceipts: vi.fn() },
    URI: { decode: vi.fn(() => ({})) }
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

vi.mock('components/DateRange', () => ({
  DateRange: ({ from, to }: any) => (
    <div data-testid="date-range">
      <button onClick={() => from?.onChange?.(dayjs('2024-01-01'))}>Set From</button>
      <button onClick={() => to?.onChange?.(dayjs('2024-12-31'))}>Set To</button>
      <button onClick={() => from?.onChange?.(null)}>Clear From</button>
    </div>
  )
}));

/**
 * ResponsiveDrawer: always render children inside drawer
 */
vi.mock('components/ResponsiveDrawer', () => ({
  ResponsiveDrawer: ({ children, open, onOpen, onClose, label }: any) => (
    <div data-testid="responsive-drawer">
      <button data-testid="drawer-trigger" onClick={onOpen}>
        {label}
      </button>
      {open && (
        <div data-testid="drawer-panel">
          <button data-testid="drawer-close" onClick={onClose}>
            Close
          </button>
        </div>
      )}
      {children}
    </div>
  )
}));

// Helpers
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

// Tests
describe('ReceiptsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({ mutate: vi.fn() });
    setupSearch();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe('Rendering', () => {
    it('renders page header', () => {
      render(<ReceiptsList />);
      expect(screen.getByText('menu.receipts.pageTitle')).toBeInTheDocument();
    });

    it('renders filter controls', () => {
      render(<ReceiptsList />);
      expect(screen.getByTestId('responsive-drawer')).toBeInTheDocument();
      expect(screen.getByLabelText('fields.noticeCode')).toBeInTheDocument();
      expect(screen.getByTestId('apply-filters')).toBeInTheDocument();
      expect(screen.getByText('actions.resetFilters')).toBeInTheDocument();
      expect(screen.getByTestId('date-range')).toBeInTheDocument();
    });

    it('renders receipts', () => {
      render(<ReceiptsList />);
      expect(screen.getByTestId('receipt-1')).toBeInTheDocument();
      expect(screen.getByTestId('receipt-2')).toBeInTheDocument();
      expect(screen.getByText('ACI Automobile Club Italia')).toBeInTheDocument();
    });

    it('renders pagination', () => {
      render(<ReceiptsList />);
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  // ── Drawer open / close ────────────────────────────────────────────────────

  describe('Drawer interactions', () => {
    it('drawer is closed by default', () => {
      render(<ReceiptsList />);
      expect(screen.queryByTestId('drawer-panel')).not.toBeInTheDocument();
    });

    it('opens the drawer when the trigger button is clicked', () => {
      render(<ReceiptsList />);
      fireEvent.click(screen.getByTestId('drawer-trigger'));
      expect(screen.getByTestId('drawer-panel')).toBeInTheDocument();
    });

    it('closes the drawer after applying filters', async () => {
      render(<ReceiptsList />);
      fireEvent.click(screen.getByTestId('drawer-trigger'));
      expect(screen.getByTestId('drawer-panel')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('apply-filters'));

      await waitFor(() => {
        expect(screen.queryByTestId('drawer-panel')).not.toBeInTheDocument();
      });
    });

    it('closes the drawer after resetting filters', async () => {
      render(<ReceiptsList />);
      fireEvent.click(screen.getByTestId('drawer-trigger'));
      expect(screen.getByTestId('drawer-panel')).toBeInTheDocument();

      fireEvent.click(screen.getByText('actions.resetFilters'));

      await waitFor(() => {
        expect(screen.queryByTestId('drawer-panel')).not.toBeInTheDocument();
      });
    });
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  describe('Filtering', () => {
    it('applies search code filter', async () => {
      const mockApplyFilters = vi.fn();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      render(<ReceiptsList />);

      fireEvent.change(screen.getByLabelText('fields.noticeCode'), {
        target: { value: '  123456789  ' }
      });
      fireEvent.click(screen.getByTestId('apply-filters'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({ noticeNumberOrIuv: '123456789' });
      });
    });

    it('applies date filters', async () => {
      const mockApplyFilters = vi.fn();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      render(<ReceiptsList />);

      fireEvent.click(screen.getByText('Set From'));
      fireEvent.click(screen.getByText('Set To'));
      fireEvent.click(screen.getByTestId('apply-filters'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalledWith({
          paymentDateTimeFrom: dayjs('2024-01-01').format(),
          paymentDateTimeTo: dayjs('2024-12-31').format()
        });
      });
    });

    it('clears all filters and calls applyFilters with empty object', async () => {
      const mockApplyFilters = vi.fn();
      (useSearch as Mock).mockReturnValue({
        query: { data: mockReceipts, isError: false, isSuccess: true },
        applyFilters: mockApplyFilters
      });

      render(<ReceiptsList />);

      const searchInput = screen.getByLabelText('fields.noticeCode') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: '123' } });
      fireEvent.click(screen.getByText('Set From'));

      fireEvent.click(screen.getByText('actions.resetFilters'));

      await waitFor(() => {
        expect(searchInput.value).toBe('');
        expect(mockApplyFilters).toHaveBeenCalledWith({});
      });
    });
  });

  // ── Error & empty states ───────────────────────────────────────────────────

  describe('Error and Empty States', () => {
    it('retries with the current applied filters on retry click', async () => {
      const mockApplyFilters = vi.fn();
      (useSearch as Mock).mockReturnValue({
        query: { data: undefined, isError: true, isSuccess: false },
        applyFilters: mockApplyFilters
      });

      render(<ReceiptsList />);
      fireEvent.click(screen.getByTestId('retry-btn'));

      await waitFor(() => {
        expect(mockApplyFilters).toHaveBeenCalled();
      });
    });
  });
});
