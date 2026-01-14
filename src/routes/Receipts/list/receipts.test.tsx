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
      orgName: 'ACI Automobile Club Italia',
      paymentAmountCents: 53322,
      paymentDateTime: '2024-11-05T10:57:06Z'
    },
    {
      receiptId: 2,
      orgName: 'Comune di Roma',
      paymentAmountCents: 53861,
      paymentDateTime: '2024-11-05T10:43:56Z'
    }
  ]
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

vi.mock('./ReceiptDataGrid', () => ({
  ReceiptDataGrid: ({ data }: any) => (
    <div data-testid="receipt-data-grid">
      {data.content.map((receipt: any) => (
        <div key={receipt.receiptId}>{receipt.orgName}</div>
      ))}
    </div>
  )
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

vi.mock('components/NoData', () => ({
  NoData: ({ title, text }: any) => (
    <div data-testid="no-data-component">
      <div>{title}</div>
      <div>{text}</div>
    </div>
  )
}));

vi.mock('components/QueryLoader', () => ({
  default: ({ children, loading }: any) => (loading ? <div>Loading...</div> : children)
}));

describe('ReceiptsList', () => {
  const mockApplyFilters = vi.fn();

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  beforeEach(() => {
    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({
      mutate: vi.fn()
    });

    (useSearch as Mock).mockReturnValue({
      query: {
        data: mockReceipts,
        isError: false,
        isPending: false
      },
      applyFilters: mockApplyFilters
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
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

  it('renders ReceiptDataGrid when data is available', () => {
    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('receipt-data-grid')).toBeInTheDocument();
    expect(screen.getByText('ACI Automobile Club Italia')).toBeInTheDocument();
    expect(screen.getByText('Comune di Roma')).toBeInTheDocument();
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

    renderWithRouter(<ReceiptsList />);

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

    renderWithRouter(<ReceiptsList />);

    fireEvent.click(screen.getByTestId('retry-button'));

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalled();
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

    renderWithRouter(<ReceiptsList />);

    expect(screen.getByTestId('no-data-component')).toBeInTheDocument();
    expect(screen.getByText('app.receipts.empty.title')).toBeInTheDocument();
  });

  it('calls getPagedDebtorReceipts with brokerId', () => {
    renderWithRouter(<ReceiptsList />);

    expect(utils.loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
  });

  it('passes correct filters to useSearch', () => {
    renderWithRouter(<ReceiptsList />);

    expect(useSearch).toHaveBeenCalledWith({
      query: expect.anything(),
      filters: {
        sort: ['paymentDateTime,desc']
      }
    });
  });
});
