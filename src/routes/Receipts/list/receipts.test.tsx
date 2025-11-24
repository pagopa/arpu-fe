/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Mock } from 'vitest';
import utils from 'utils';
import { useSearch } from 'hooks/useSearch';
import { ReceiptsList } from '.';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
});

const mockReceipts = [
  {
    id: 'receipt-1',
    eventId: 'tst2.888387046189095300-8173-9980-7144-362-0',
    payeeName: 'ACI Automobile Club Italia',
    payeeTaxCode: '00493410583',
    amount: 53322,
    receiptDate: '2024-11-05T10:57:06Z'
  },
  {
    id: 'receipt-2',
    eventId: 'tst2.814804283493089500-9470-9311-9402-678-0',
    payeeName: 'ACI Automobile Club Italia',
    payeeTaxCode: '00493410583',
    amount: 53861,
    receiptDate: '2024-11-05T10:43:56Z'
  },
  {
    id: 'receipt-3',
    eventId: 'tst2.938002289163866200-6666-6117-6677-612-0',
    payeeName: 'ACI Automobile Club Italia',
    payeeTaxCode: '00493410583',
    amount: 73849,
    receiptDate: '2024-11-05T10:43:54Z'
  }
];

vi.mock('utils', () => ({
  default: {
    loaders: {
      getPagedDebtorReceipts: vi.fn()
    }
  }
}));

vi.mock('hooks/useSearch');

vi.mock(import('utils/config'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      brokerId: '123'
    }
  };
});

vi.mock('./ReceiptDataGrid', () => ({
  ReceiptDataGrid: ({ data }: any) => (
    <div data-testid="receipt-data-grid">
      {data.content.map((receipt: any) => (
        <div key={receipt.id}>{receipt.payeeName}</div>
      ))}
    </div>
  )
}));

describe('Receipts Component', () => {
  const mockApplyFilters = vi.fn();

  const createMockQuery = (overrides = {}) => ({
    data: undefined,
    isError: false,
    isPending: false,
    isSuccess: false,
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();

    (utils.loaders.getPagedDebtorReceipts as Mock).mockReturnValue({
      mutate: vi.fn()
    });

    (useSearch as Mock).mockReturnValue({
      query: createMockQuery(),
      applyFilters: mockApplyFilters
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    expect(screen.getByText('menu.receipts.pageTitle')).toBeInTheDocument();
  });

  it('renders error component when query fails', () => {
    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({ isError: true }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    // Retry component should be rendered
    expect(screen.queryByTestId('receipt-data-grid')).not.toBeInTheDocument();
  });

  it('calls applyFilters when retry is clicked after error', async () => {
    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({ isError: true }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    // Find and click retry button (implementation depends on Retry component)
    // This assumes the Retry component has a clickable element
    const retryButton = screen.getByRole('button');
    retryButton.click();

    await waitFor(() => {
      expect(mockApplyFilters).toHaveBeenCalled();
    });
  });

  it('renders ReceiptDataGrid when data is available', () => {
    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({
        data: { content: mockReceipts },
        isSuccess: true
      }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('receipt-data-grid')).toBeInTheDocument();
    expect(screen.getAllByText('ACI Automobile Club Italia')).toHaveLength(3);
  });

  it('renders NoData component when no receipts are returned', () => {
    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({
        data: { content: [] },
        isSuccess: true
      }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    expect(
      screen.getByText('app.paymentNotice.filtered.nodata.ownedByMe.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('app.paymentNotice.filtered.nodata.ownedByMe.text')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('receipt-data-grid')).not.toBeInTheDocument();
  });

  it('calls getPagedDebtorReceipts with correct brokerId', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    expect(utils.loaders.getPagedDebtorReceipts).toHaveBeenCalledWith(123);
  });

  it('renders page title in helmet', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    // Check that Helmet is rendering the title
    // Note: Testing Helmet requires additional setup or checking document.title
    expect(screen.getByText('menu.receipts.pageTitle')).toBeInTheDocument();
  });

  it('passes correct data to ReceiptDataGrid', () => {
    const testData = { content: mockReceipts };

    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({
        data: testData,
        isSuccess: true
      }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    const dataGrid = screen.getByTestId('receipt-data-grid');
    expect(dataGrid).toBeInTheDocument();

    // Verify all receipts are rendered
    mockReceipts.forEach((receipt) => {
      expect(screen.getAllByText(receipt.payeeName).length).toBeGreaterThan(0);
    });
  });

  it('handles undefined data gracefully', () => {
    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({
        data: undefined,
        isSuccess: true
      }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    // Should render NoData when data is undefined
    expect(
      screen.getByText('app.paymentNotice.filtered.nodata.ownedByMe.title')
    ).toBeInTheDocument();
  });

  it('handles data with undefined content property', () => {
    (useSearch as Mock).mockReturnValue({
      query: createMockQuery({
        data: {},
        isSuccess: true
      }),
      applyFilters: mockApplyFilters
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReceiptsList />
      </QueryClientProvider>
    );

    // Should render NoData when content is undefined
    expect(
      screen.getByText('app.paymentNotice.filtered.nodata.ownedByMe.title')
    ).toBeInTheDocument();
  });
});
