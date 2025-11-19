/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import utils from 'utils';
import React from 'react';
import loaders from './loaders';

vi.mock('utils', () => ({
  default: {
    arpuBeApiClient: {
      brokers: {
        getPagedDebtorReceipts: vi.fn()
      }
    }
  }
}));

describe('getLastReceipts', () => {
  let queryClient: QueryClient;

  const mockReceiptsResponse = {
    data: {
      content: [
        {
          receiptId: 1,
          organizationId: 100,
          orgFiscalCode: '12345678901',
          orgName: 'Organization 1',
          paymentAmountCents: 10000,
          paymentDateTime: '2024-01-15T10:30:00Z',
          receiptOrigin: 'PAYMENT_NOTICE',
          installmentId: 1,
          remittanceInformation: 'Payment 1',
          debtPositionTypeOrgDescription: 'Org debt type 1',
          debtPositionTypeDescription: 'Debt type 1',
          serviceType: 'Standard'
        },
        {
          receiptId: 2,
          organizationId: 101,
          orgFiscalCode: '12345678902',
          orgName: 'Organization 2',
          paymentAmountCents: 20000,
          paymentDateTime: '2024-01-16T11:30:00Z',
          receiptOrigin: 'PAYMENT_NOTICE',
          installmentId: 2,
          remittanceInformation: 'Payment 2',
          debtPositionTypeOrgDescription: 'Org debt type 2',
          debtPositionTypeDescription: 'Debt type 2',
          serviceType: 'Standard'
        },
        {
          receiptId: 3,
          organizationId: 102,
          orgFiscalCode: '12345678903',
          orgName: 'Organization 3',
          paymentAmountCents: 30000,
          paymentDateTime: '2024-01-17T12:30:00Z',
          receiptOrigin: 'PAYMENT_NOTICE',
          installmentId: 3,
          remittanceInformation: 'Payment 3',
          debtPositionTypeOrgDescription: 'Org debt type 3',
          debtPositionTypeDescription: 'Debt type 3',
          serviceType: 'Standard'
        }
      ],
      totalElements: 10,
      totalPages: 4,
      size: 3,
      number: 0
    }
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

    vi.mocked(utils.arpuBeApiClient.brokers.getPagedDebtorReceipts).mockResolvedValue(
      mockReceiptsResponse as any
    );
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch last receipts successfully', async () => {
    const brokerId = 456;
    const { result } = renderHook(() => loaders.getLastReceipts(brokerId), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(utils.arpuBeApiClient.brokers.getPagedDebtorReceipts).toHaveBeenCalledWith(brokerId, {
      page: 0,
      size: 3,
      sort: ['paymentDateTime,desc']
    });

    expect(result.current.data).toEqual(mockReceiptsResponse.data);
    expect(result.current.data?.content).toHaveLength(3);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network error';
    vi.mocked(utils.arpuBeApiClient.brokers.getPagedDebtorReceipts).mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => loaders.getLastReceipts(123), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
