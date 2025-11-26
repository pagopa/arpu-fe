/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '__tests__/renderers';
import { useReceiptDetail } from './useReceiptDetail';
import utils from 'utils';

// Mock the API client method
vi.mock('utils', async (importOriginal: any) => ({
  default: {
    ...(await importOriginal()),
    arpuBeApiClient: {
      brokers: {
        getReceiptDetail: vi.fn()
      }
    }
  }
}));

describe('useReceiptDetail', () => {
  const mockArgs = [1, 'receiptIdExample'] as any;
  const mockData = {
    id: 'receiptIdExample',
    amount: 100,
    status: 'PAID'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data correctly on successful fetch', async () => {
    vi.mocked(utils.arpuBeApiClient.brokers.getReceiptDetail).mockResolvedValue({
      data: mockData
    } as any);

    const { result } = renderHook(() => useReceiptDetail(mockArgs));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('isLoading is true initially', () => {
    vi.mocked(utils.arpuBeApiClient.brokers.getReceiptDetail).mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useReceiptDetail(mockArgs));

    expect(result.current.isLoading).toBe(true);
  });

  it('handles error state correctly', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(utils.arpuBeApiClient.brokers.getReceiptDetail).mockRejectedValue(error);

    const { result } = renderHook(() => useReceiptDetail(mockArgs));

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
