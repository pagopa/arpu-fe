/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DebtPositions } from './DebtPositions';
import '@testing-library/jest-dom';
import { Mock } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';

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
    },
    {
      debtPositionId: 3,
      organizationName: 'Organization 3',
      amount: 15000,
      dueDate: '2024-12-20'
    }
  ]
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

vi.mock('routes/DebtPositions/components/item', () => ({
  DebtPositionItem: ({ debtPosition }: any) => (
    <div data-testid={`debt-position-${debtPosition.debtPositionId}`}>
      {debtPosition.organizationName}
    </div>
  )
}));

describe('DebtPositions', () => {
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

  it('renders debt positions list', () => {
    render(<DebtPositions />);

    expect(screen.getByText('app.dashboard.lastDebtPositions')).toBeInTheDocument();
    expect(screen.getByTestId('debt-position-1')).toBeInTheDocument();
    expect(screen.getByTestId('debt-position-2')).toBeInTheDocument();
    expect(screen.getByTestId('debt-position-3')).toBeInTheDocument();
  });

  it('calls usePagedUnpaidDebtPositions with brokerId', () => {
    render(<DebtPositions />);

    expect(utils.loaders.usePagedUnpaidDebtPositions).toHaveBeenCalledWith(123);
  });

  it('passes correct filters to useSearch', () => {
    render(<DebtPositions />);

    expect(useSearch).toHaveBeenCalledWith({
      query: expect.anything(),
      filters: {
        sort: [],
        size: 3,
        page: 0
      }
    });
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

    render(<DebtPositions />);

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

    render(<DebtPositions />);

    fireEvent.click(screen.getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalledWith({
        sort: [],
        size: 3,
        page: 0
      });
    });
  });

  it('shows no data component when content is empty', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: [] },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositions />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    expect(screen.getByTestId('no-data-title')).toHaveTextContent('app.debtPositions.empty.title');
    expect(screen.getByTestId('no-data-text')).toHaveTextContent(
      'app.debtPositions.empty.subtitle'
    );
  });

  it('shows no data component when content is undefined', () => {
    (useSearch as Mock).mockReturnValue({
      query: {
        data: { content: undefined },
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });

    render(<DebtPositions />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
  });
});
