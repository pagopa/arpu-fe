/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '__tests__/renderers';
import { useDownloadReceipt } from './useDownloadReceipt';
import utils from 'utils';
import { Mock } from 'vitest';

vi.mock('utils', async (importOriginal: any) => ({
  default: {
    ...(await importOriginal()),
    arpuBeApiClient: {
      brokers: {
        getReceiptPdf: vi.fn()
      }
    },
    converters: {
      extractFilename: vi.fn()
    }
  }
}));

describe('useDownloadReceipt', () => {
  beforeEach(() => {
    const mockBlob = new Blob(['test pdf content'], { type: 'application/pdf' });

    (utils.arpuBeApiClient.brokers.getReceiptPdf as Mock).mockResolvedValue({
      data: mockBlob,
      headers: {
        'content-disposition': 'attachment; filename="receipt_123.pdf"'
      }
    });

    (utils.converters.extractFilename as Mock).mockReturnValue('receipt_123.pdf');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('downloads receipt successfully', async () => {
    const args: [number, number, number] = [999, 456, 123];

    const { result } = renderHook(() => useDownloadReceipt(args));

    expect(result.current.isPending).toBe(false);

    const promise = result.current.mutateAsync();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const response = await promise;

    expect(response.blob).toBeInstanceOf(Blob);
    expect(response.filename).toBe('receipt_123.pdf');
    expect(utils.arpuBeApiClient.brokers.getReceiptPdf).toHaveBeenCalledWith(999, 456, 123, {
      format: 'blob'
    });
  });

  it('handles missing content-disposition header', async () => {
    const args: [number, number, number] = [999, 456, 123];

    (utils.arpuBeApiClient.brokers.getReceiptPdf as Mock).mockResolvedValue({
      data: new Blob(['test pdf content'], { type: 'application/pdf' }),
      headers: {}
    });

    (utils.converters.extractFilename as Mock).mockReturnValue(null);

    const { result } = renderHook(() => useDownloadReceipt(args));

    const response = await result.current.mutateAsync();

    expect(utils.converters.extractFilename).toHaveBeenCalledWith('');
    expect(response.filename).toBeNull();
  });

  it('handles API errors correctly', async () => {
    const args: [number, number, number] = [999, 456, 123];
    const errorMessage = 'Failed to download receipt';

    (utils.arpuBeApiClient.brokers.getReceiptPdf as Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useDownloadReceipt(args));

    let error;
    try {
      await result.current.mutateAsync();
    } catch (e) {
      error = e;
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(errorMessage);
  });

  it('handles network errors', async () => {
    const args: [number, number, number] = [999, 456, 123];

    (utils.arpuBeApiClient.brokers.getReceiptPdf as Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useDownloadReceipt(args));

    try {
      await result.current.mutateAsync();
    } catch (error) {
      expect((error as Error).message).toBe('Network error');
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
