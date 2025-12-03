/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import { Receipts } from './Receipts';
import { Mock, vi } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';

// Mock storage.app.getBrokerId
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

vi.mock('routes/Receipts/components/ReceiptsPreview', () => ({
  ReceiptsPreview: ({ rows }: any) => (
    <div data-testid="receipts-preview">
      {rows?.map((r: any, i: number) => (
        <div key={i} data-testid={`receipt-${r.id || i}`}>
          {r.id || i}
        </div>
      ))}
    </div>
  )
}));

describe('Receipts component', () => {
  const mockApplyFilters = vi.fn();
  const mockReceiptsData = {
    content: [
      { id: 'r1', amount: 100 },
      { id: 'r2', amount: 150 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(utils.storage.app, 'getBrokerId').mockReturnValue(123);
    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({
      mutate: vi.fn()
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

  it('renders with title and ReceiptsPreview when data exists', () => {
    render(<Receipts />);

    expect(screen.getByText('app.dashboard.lastTransactions')).toBeInTheDocument();
    expect(screen.getByText('app.dashboard.seeAllTransactions')).toBeInTheDocument();
    expect(screen.getByTestId('receipts-preview')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-r1')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-r2')).toBeInTheDocument();
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
  });

  it('calls applyFilters with filters when retry clicked', async () => {
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
});
