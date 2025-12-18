/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '__tests__/renderers';
import React, { ReactNode } from 'react';
import 'whatwg-fetch';
import loaders from 'utils/loaders';
import utils from 'utils';
import { StoreProvider } from 'store/GlobalStore';
import { AxiosResponse } from 'axios';

// importing schemas from utils
// causes an import resolution issue
import * as schemas from '../../generated/zod-schema';
import {
  debtPositionRequestDTOSchema,
  debtPositionResponseDTOSchema,
  debtPositionTypeOrgsWithSpontaneousDTOSchema,
  organizationsWithSpontaneousDTOSchema,
  pagedDebtorDebtPositionDTOSchema
} from '../../generated/zod-schema';
// zodock can create mock object
// from a zod schema
// if a field is set as optionaal
// it will be generated as undefined
import { createMock } from 'zodock';
import zod from 'zod';
import { Mock } from 'vitest';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <StoreProvider>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </StoreProvider>
);

describe('api loaders', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </StoreProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userInfo', () => {
    const dataMock = createMock(schemas.userInfoSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.auth, 'getUserInfo')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    it('getUserInfo api is called', async () => {
      const { result } = renderHook(() => loaders.getUserInfo(), { wrapper });

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalled();
        expect(result.current.data).toEqual(dataMock);
      });
    });

    describe('getUserInfoOnce', () => {
      it('fetch if sessionStorage.userInfo is missing', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

        const { result } = renderHook(() => loaders.getUserInfoOnce(), {
          wrapper
        });

        await waitFor(() => {
          expect(utils.apiClient.auth.getUserInfo).toHaveBeenCalled();
          expect(result.current.isSuccess).toBeTruthy();
          expect(result.current.data).toEqual(dataMock);
        });
      });

      it('does not fetch if sessionStorage.userInfo is set', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('true');

        const { result } = renderHook(() => loaders.getUserInfoOnce(), {
          wrapper
        });

        expect(utils.apiClient.auth.getUserInfo).not.toHaveBeenCalled();
        expect(result.current.isSuccess).toBeTruthy();
        expect(result.current.fetchStatus).toBe('idle');
      });
    });
  });

  describe('getTokenOneidentity function', () => {
    it('returns Token correctly', async () => {
      const dataMock = createMock(schemas.tokenResponseSchema);

      const apiMock = vi
        .spyOn(utils.apiClient.token, 'getAuthenticationToken')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const request = new Request('https://website.it/auth-callback?code=code123&state=state123');
      const token = await loaders.getTokenOneidentity(request);

      expect(apiMock).toHaveBeenCalledWith(
        {
          code: 'code123',
          state: 'state123'
        },
        { withCredentials: true }
      );
      expect(token).toEqual(dataMock);
    });

    it('should return null on failure', async () => {
      const mockRequest = (url: string): Request =>
        ({
          url
        }) as unknown as Request;

      vi.mocked(utils.apiClient.token.getAuthenticationToken).mockRejectedValue(new Error());

      const request = mockRequest('https://sito.it/?code=dummyCode&state=dummyState');
      const result = await loaders.getTokenOneidentity(request);

      expect(result).toBe(null);
    });
  });
});

describe('Payment Notices API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOrganizationsWithSpontaneous calls API and schema parser correctly', async () => {
    const dataMock = createMock(zod.array(organizationsWithSpontaneousDTOSchema));

    const apiMock = vi
      .spyOn(utils.apiClient.brokers, 'getOrganizationsWithSpontaneous')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const query = renderHook(() => loaders.getOrganizationsWithSpontaneous(1), { wrapper });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(dataMock);
    });
  });

  it('getDebtPositionTypeOrgsWithSpontaneous calls API and schema parser correctly', async () => {
    const dataMock = createMock(zod.array(debtPositionTypeOrgsWithSpontaneousDTOSchema));

    const apiMock = vi
      .spyOn(utils.apiClient.brokers, 'getDebtPositionTypeOrgsWithSpontaneous')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const query = renderHook(() => loaders.getDebtPositionTypeOrgsWithSpontaneous(1, 3), {
      wrapper
    });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, 3);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(dataMock);
    });
  });

  it('getDebtPositionTypeOrgsWithSpontaneousDetail calls API and schema parser correctly', async () => {
    const dataMock = createMock(debtPositionTypeOrgsWithSpontaneousDTOSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.brokers, 'getDebtPositionTypeOrgsWithSpontaneousDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const query = renderHook(() => loaders.getDebtPositionTypeOrgsWithSpontaneousDetail(1, 2, 3), {
      wrapper
    });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, 2, 3);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(dataMock);
    });
  });

  it('createSpontaneousDebtPosition calls API and schema parser correctly', async () => {
    const bodyMock = createMock(debtPositionRequestDTOSchema);
    const responseMock = createMock(debtPositionResponseDTOSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.brokers, 'createSpontaneousDebtPosition')
      .mockResolvedValue({ data: responseMock } as AxiosResponse);

    const query = renderHook(() => loaders.createSpontaneousDebtPosition(1, bodyMock), {
      wrapper
    });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, bodyMock);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(responseMock);
    });
  });

  it('getPaymentNotice mutation calls API and extract filename correctly', async () => {
    const apiMock = vi.spyOn(utils.apiClient.brokers, 'getPaymentNotice').mockResolvedValue({
      data: 'Test',
      headers: { 'content-disposition': "attachment; filename='test.pdf'" }
    } as unknown as AxiosResponse);

    const mutation = renderHook(() => loaders.getPaymentNotice(1, 3, { iuv: '1' }), {
      wrapper
    });

    await mutation.result.current.mutateAsync();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, 3, { iuv: '1' }, { format: 'blob' });
      expect(mutation.result.current.isSuccess).toBeTruthy();
      expect(mutation.result.current.data).toEqual({ data: 'Test', filename: 'test.pdf' });
    });
  });

  it('getPublicDebtPositionTypeOrgsWithSpontaneous calls API and schema parser correctly', async () => {
    const dataMock = createMock(zod.array(debtPositionTypeOrgsWithSpontaneousDTOSchema));

    const apiMock = vi
      .spyOn(utils.apiClient.public, 'getPublicDebtPositionTypeOrgsWithSpontaneous')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const query = renderHook(
      () => loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneous(1, 3),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, 3);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(dataMock);
    });
  });

  it('createPublicSpontaneousDebtPosition calls API and schema parser correctly', async () => {
    const bodyMock = createMock(debtPositionRequestDTOSchema);
    const responseMock = createMock(debtPositionResponseDTOSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.public, 'createPublicSpontaneousDebtPosition')
      .mockResolvedValue({ data: responseMock } as AxiosResponse);

    const query = renderHook(
      () => loaders.public.createPublicSpontaneousDebtPosition(1, bodyMock),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, bodyMock);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(responseMock);
    });
  });

  it('getPublicOrganizationsWithSpontaneous calls API and schema parser correctly', async () => {
    const dataMock = createMock(zod.array(organizationsWithSpontaneousDTOSchema));

    const apiMock = vi
      .spyOn(utils.apiClient.public, 'getPublicOrganizationsWithSpontaneous')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const query = renderHook(() => loaders.public.getPublicOrganizationsWithSpontaneous(1), {
      wrapper
    });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(dataMock);
    });
  });

  it('getPublicDebtPositionTypeOrgsWithSpontaneousDetail calls API and schema parser correctly', async () => {
    const dataMock = createMock(debtPositionTypeOrgsWithSpontaneousDTOSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.public, 'getPublicDebtPositionTypeOrgsWithSpontaneousDetail')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const query = renderHook(
      () => loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneousDetail(1, 2, 3),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, 2, 3);
      expect(query.result.current.isSuccess).toBeTruthy();
      expect(query.result.current.data).toEqual(dataMock);
    });
  });

  it('getPublicPaymentNotice mutation calls API and extract filename correctly', async () => {
    const apiMock = vi.spyOn(utils.apiClient.public, 'getPublicPaymentNotice').mockResolvedValue({
      data: 'Test',
      headers: { 'content-disposition': "attachment; filename='test.pdf'" }
    } as unknown as AxiosResponse);

    const mutation = renderHook(
      () => loaders.public.getPublicPaymentNotice(1, 3, { iuv: '1' }, 'FISCALCODE'),
      {
        wrapper
      }
    );

    await mutation.result.current.mutateAsync();

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        1,
        3,
        { iuv: '1' },
        { format: 'blob', headers: { 'X-fiscal-code': 'FISCALCODE' } }
      );
      expect(mutation.result.current.isSuccess).toBeTruthy();
      expect(mutation.result.current.data).toEqual({ data: 'Test', filename: 'test.pdf' });
    });
  });
});

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
    vi.spyOn(utils.apiClient.brokers, 'getReceiptDetail').mockResolvedValue({
      data: mockData
    } as any);

    const { result } = renderHook(() => loaders.useReceiptDetail(mockArgs));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('handles error state correctly', async () => {
    vi.spyOn(utils.apiClient.brokers, 'getReceiptDetail').mockRejectedValue(new Error('API Error'));

    try {
      renderHook(() => loaders.useReceiptDetail(mockArgs));
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe('API Error');
    }
  });
});

describe('useDownloadReceipt', () => {
  beforeEach(() => {
    const mockBlob = new Blob(['test pdf content'], { type: 'application/pdf' });

    vi.spyOn(utils.apiClient.brokers, 'getReceiptPdf').mockResolvedValue({
      data: mockBlob,
      headers: {
        'content-disposition': 'attachment; filename="receipt_123.pdf"'
      }
    } as any);

    vi.spyOn(utils.converters, 'extractFilename').mockReturnValue('receipt_123.pdf');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('downloads receipt successfully', async () => {
    const args = { brokerId: 999 };

    const { result } = renderHook(() => loaders.useDownloadReceipt(args));

    expect(result.current.isPending).toBe(false);

    const promise = result.current.mutateAsync({
      organizationId: 456,
      receiptId: 123
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const response = await promise;

    expect(response.blob).toBeInstanceOf(Blob);
    expect(response.filename).toBe('receipt_123.pdf');
    expect(utils.apiClient.brokers.getReceiptPdf).toHaveBeenCalledWith(999, 456, 123, {
      format: 'blob'
    });
  });

  it('handles missing content-disposition header', async () => {
    const args = { brokerId: 999 };

    vi.spyOn(utils.apiClient.brokers, 'getReceiptPdf').mockResolvedValue({
      data: new Blob(['test pdf content'], { type: 'application/pdf' }),
      headers: {}
    } as any);

    (utils.converters.extractFilename as Mock).mockReturnValue(null);

    const { result } = renderHook(() => loaders.useDownloadReceipt(args));

    const response = await result.current.mutateAsync({ organizationId: 456, receiptId: 123 });

    expect(utils.converters.extractFilename).toHaveBeenCalledWith('');
    expect(response.filename).toBeNull();
  });

  it('handles API errors correctly', async () => {
    const args = { brokerId: 999 };
    const errorMessage = 'Failed to download receipt';

    vi.spyOn(utils.apiClient.brokers, 'getReceiptPdf').mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => loaders.useDownloadReceipt(args));

    let error;
    try {
      await result.current.mutateAsync({ organizationId: 456, receiptId: 123 });
    } catch (e) {
      error = e;
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(errorMessage);
  });
});

const mockBrokerData = {
  brokerFiscalCode: 999,
  brokerName: 'Test Broker',
  brokerLogo: 'TB001'
};

describe('useBrokerInfo', () => {
  beforeEach(() => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: mockBrokerData
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches broker info successfully', async () => {
    const { result } = renderHook(() => loaders.public.useBrokerInfo(999));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBrokerData);
    expect(utils.apiClient.public.getPublicBrokerInfo).toHaveBeenCalledWith(999);
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'Failed to fetch broker info';

    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockRejectedValue(
      new Error(errorMessage)
    );

    try {
      renderHook(() => loaders.public.useBrokerInfo(999));
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe(errorMessage);
    }
  });

  it('caches results with infinite gcTime', async () => {
    const { result, rerender } = renderHook(() => loaders.public.useBrokerInfo(999));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Rerender the same hook instance
    rerender();

    expect(result.current.data).toEqual(mockBrokerData);
    expect(utils.apiClient.public.getPublicBrokerInfo).toHaveBeenCalledTimes(1);
  });
});

describe('useBrokerInfo', () => {
  beforeEach(() => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: mockBrokerData
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches broker info successfully', async () => {
    const { result } = renderHook(() => loaders.public.useBrokerInfo(999));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBrokerData);
    expect(utils.apiClient.public.getPublicBrokerInfo).toHaveBeenCalledWith(999);
  });

  it('handles API errors correctly', async () => {
    const errorMessage = 'Failed to fetch broker info';

    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockRejectedValue(
      new Error(errorMessage)
    );

    try {
      renderHook(() => loaders.public.useBrokerInfo(999));
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toBe(errorMessage);
    }
  });

  it('caches results with infinite gcTime', async () => {
    const { result, rerender } = renderHook(() => loaders.public.useBrokerInfo(999));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Rerender the same hook instance
    rerender();

    expect(result.current.data).toEqual(mockBrokerData);
    expect(utils.apiClient.public.getPublicBrokerInfo).toHaveBeenCalledTimes(1);
  });
});

describe('getPagedDebtorReceipts', () => {
  it('calls API enpoint correctly', async () => {
    const dataMock = createMock(pagedDebtorDebtPositionDTOSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.brokers, 'getPagedDebtorReceipts')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const mutation = renderHook(() => loaders.getPagedDebtorReceipts(1), {
      wrapper
    });

    await mutation.result.current.mutateAsync({ pagination: { page: 1, size: 10 }, sort: [] });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, { page: 1, size: 10, sort: [] });
      expect(mutation.result.current.isSuccess).toBeTruthy();
      expect(mutation.result.current.data).toEqual(dataMock);
    });
  });
});

describe('usePagedUnpaidDebtPositions', () => {
  it('calls API enpoint correctly', async () => {
    const dataMock = createMock(pagedDebtorDebtPositionDTOSchema);

    const apiMock = vi
      .spyOn(utils.apiClient.brokers, 'getPagedUnpaidDebtPositions')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const mutation = renderHook(() => loaders.usePagedUnpaidDebtPositions(1), {
      wrapper
    });

    await mutation.result.current.mutateAsync({ pagination: { page: 1, size: 10 }, sort: [] });

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(1, { page: 1, size: 10, sort: [] });
      expect(mutation.result.current.isSuccess).toBeTruthy();
      expect(mutation.result.current.data).toEqual(dataMock);
    });
  });
});

const mockInstallmentsData = [
  {
    iuv: '123456789012345678',
    orgName: 'Test Organization',
    amountCents: 10000
  }
];

describe('usePublicInstallmentsByIuvOrNav', () => {
  beforeEach(() => {
    vi.spyOn(utils.apiClient.public, 'getPublicInstallmentsByIuvOrNav').mockResolvedValue({
      data: mockInstallmentsData
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches installments successfully', async () => {
    const { result } = renderHook(() => loaders.public.usePublicInstallmentsByIuvOrNav(999));

    await result.current.mutateAsync({
      iuvOrNav: '123456789012345678',
      fiscalCode: 'RSSMRA80A01H501U'
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(utils.apiClient.public.getPublicInstallmentsByIuvOrNav).toHaveBeenCalledWith(
      999,
      { iuvOrNav: '123456789012345678' },
      { headers: { 'X-fiscal-code': 'RSSMRA80A01H501U' } }
    );
  });

  it('handles API errors', async () => {
    vi.spyOn(utils.apiClient.public, 'getPublicInstallmentsByIuvOrNav').mockRejectedValue(
      new Error('Failed')
    );

    const { result } = renderHook(() => loaders.public.usePublicInstallmentsByIuvOrNav(999));

    try {
      await result.current.mutateAsync({
        iuvOrNav: '123456789012345678',
        fiscalCode: 'RSSMRA80A01H501U'
      });
    } catch (e) {
      // Expected error
    }

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
