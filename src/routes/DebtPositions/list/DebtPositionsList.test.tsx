/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { Mock } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';
import { DebtPositionsList } from '.';

const mockDebtPositionsData = {
  content: [
    {
      debtPositionId: 1,
      organizationName: 'Organization 1',
      amount: 10000,
      dueDate: '2024-12-31'
    },
    {
      debtPositionId: 2,
      organizationName: 'Organization 2',
      amount: 20000,
      dueDate: '2024-12-25'
    }
  ],
  totalPages: 3
};

vi.mock('utils', () => ({
  default: {
    storage: {
      app: {
        getBrokerId: vi.fn()
      }
    },
    loaders: {
      usePagedUnpaidDebtPositions: vi.fn()
    }
  }
}));

vi.mock('hooks/useSearch');

vi.mock('components/Content', () => ({
  Content: ({ children, showRetry, noData, onRetry, noDataCta, noDataTitle, noDataText }: any) => {
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
          <div data-testid="no-data-cta">{noDataCta}</div>
        </div>
      );
    }
    return <div data-testid="content-component">{children}</div>;
  }
}));

vi.mock('../components/item', () => ({
  DebtPositionItem: ({ debtPosition }: any) => (
    <div data-testid={`debt-position-${debtPosition.debtPositionId}`}>
      {debtPosition.organizationName}
    </div>
  )
}));

vi.mock('components/DataGrid/CustomPagination', () => ({
  default: ({ totalPages }: any) => <div data-testid="pagination">Pages: {totalPages}</div>
}));

vi.mock('components/PaymentButton', () => ({
  default: () => <button data-testid="payment-button">Pay</button>
}));

describe('DebtPositionsList', () => {
  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    vi.spyOn(utils.storage.app, 'getBrokerId').mockReturnValue(123);

    (utils.loaders.usePagedUnpaidDebtPositions as Mock).mockReturnValue({
      mutate: vi.fn()
    });

    (useSearch as Mock).mockReturnValue({
      query: {
        data: mockDebtPositionsData,
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders debt positions list with title', () => {
    render(<DebtPositionsList />);

    expect(screen.getByText('app.debtPositions.list.title')).toBeInTheDocument();
    expect(screen.getByTestId('debt-position-1')).toBeInTheDocument();
    expect(screen.getByTestId('debt-position-2')).toBeInTheDocument();
  });

  it('calls usePagedUnpaidDebtPositions with brokerId', () => {
    render(<DebtPositionsList />);

    expect(utils.loaders.usePagedUnpaidDebtPositions).toHaveBeenCalledWith(123);
  });

  it('passes correct filters to useSearch', () => {
    render(<DebtPositionsList />);

    expect(useSearch).toHaveBeenCalledWith({
      query: expect.anything(),
      filters: {
        sort: []
      }
    });
  });

  it('renders pagination when totalPages > 0', () => {
    render(<DebtPositionsList />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('Pages: 3')).toBeInTheDocument();
  });

  it('does not render pagination when totalPages is 0', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { ...mockDebtPositionsData, totalPages: 0 },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositionsList />);

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('does not render pagination when totalPages is undefined', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { ...mockDebtPositionsData, totalPages: undefined },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositionsList />);

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });

  it('shows retry component on error', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: undefined,
        isError: true,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositionsList />);

    expect(screen.getByTestId('retry-component')).toBeInTheDocument();
  });

  it('calls applyFilters when retry is clicked', async () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: undefined,
        isError: true,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositionsList />);

    fireEvent.click(screen.getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalledWith({
        sort: []
      });
    });
  });

  it('shows no data component with payment button', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: [] },
        isError: false,
        isPending: false,
        isSuccess: true
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositionsList />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    expect(screen.getByTestId('no-data-title')).toHaveTextContent('app.debtPositions.empty.title');
    expect(screen.getByTestId('no-data-text')).toHaveTextContent(
      'app.debtPositions.empty.subtitle'
    );
    expect(screen.getByTestId('payment-button')).toBeInTheDocument();
  });
});
