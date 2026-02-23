import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { CourtesyPageActions } from './CourtesyPageActions';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useSearchParams: vi.fn() };
});

import { useSearchParams } from 'react-router-dom';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { render } from '__tests__/renderers';

const mockPostCartsMutate = vi.fn();
const mockInstallmentsMutateAsync = vi.fn();
const mockDownloadMutateAsync = vi.fn();

vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: (opts: { onSuccess: (url: string) => void; onError: () => void }) => ({
    mutate: (...args: unknown[]) => {
      mockPostCartsMutate(...args);
      opts.onSuccess('https://checkout.test');
    },
    isPending: false
  })
}));

vi.mock('utils/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils/storage')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      app: {
        getBrokerId: vi.fn(() => 'broker-123')
      }
    }
  };
});

vi.mock('utils/files', () => ({
  default: {
    downloadBlob: vi.fn()
  }
}));

vi.mock('utils/notify', () => ({
  default: {
    emit: vi.fn()
  }
}));

vi.mock('utils/loaders', () => ({
  default: {
    public: {
      usePublicInstallmentsByIuvOrNav: vi.fn(() => ({
        mutateAsync: mockInstallmentsMutateAsync
      })),
      getPublicPaymentNotice: vi.fn(() => ({
        mutateAsync: mockDownloadMutateAsync
      }))
    }
  }
}));

i18nTestSetup({
  courtesyPage: {
    424: {
      cta: 'Retry',
      downloadCta: 'Download notice'
    }
  },
  errors: {
    toast: {
      payment: 'Payment error'
    }
  },
  app: {
    receiptDetail: {
      downloadError: 'Download error'
    }
  }
});

const INSTALLMENT_MATCH = {
  installmentId: 42,
  iuv: 'IUV-001',
  nav: 'NAV-001',
  amountCents: 10000,
  remittanceInformation: 'Test payment',
  orgFiscalCode: 'FISCAL-001',
  orgName: 'Test Org',
  organizationId: 99
};

const INSTALLMENT_OTHER = {
  installmentId: 99,
  iuv: 'IUV-OTHER',
  nav: 'NAV-OTHER',
  amountCents: 5000,
  remittanceInformation: 'Other payment',
  orgFiscalCode: 'FISCAL-OTHER',
  orgName: 'Other Org',
  organizationId: 50
};

const setupSearchParams = (params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams(params);
  vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
};

describe('CourtesyPageActions', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the retry and download buttons', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    expect(screen.getByTestId('courtesyPage.cta')).toHaveTextContent('Retry');
    expect(screen.getByTestId('courtesyPage.downloadCta')).toHaveTextContent('Download notice');
  });

  it('fetches installments on mount when required params are present', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalledWith({
        iuvOrNav: 'NAV-001',
        fiscalCode: 'FISCAL-001'
      });
    });
  });

  it('does not fetch installments when nav is missing', () => {
    setupSearchParams({ cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    expect(mockInstallmentsMutateAsync).not.toHaveBeenCalled();
  });

  it('does not fetch installments when cf is missing', () => {
    setupSearchParams({ nav: 'NAV-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    expect(mockInstallmentsMutateAsync).not.toHaveBeenCalled();
  });

  it('finds the correct installment by installment_id', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_OTHER, INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).toHaveBeenCalledWith({
      notices: [
        expect.objectContaining({
          nav: 'NAV-001',
          iuv: 'IUV-001',
          paTaxCode: 'FISCAL-001',
          paFullName: 'Test Org',
          description: 'Test payment',
          amount: 10000
        })
      ]
    });
  });

  it('does not call postCarts when installment is not resolved (no match)', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_OTHER]);
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('sets installment to null when fetch fails', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('Network error'));
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('calls downloadBlob on successful download', async () => {
    const filesModule = (await import('utils/files')).default;
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    mockDownloadMutateAsync.mockResolvedValue({ data: new Blob(), filename: 'notice.pdf' });
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.downloadCta'));

    await waitFor(() => {
      expect(mockDownloadMutateAsync).toHaveBeenCalled();
      expect(filesModule.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'notice.pdf');
    });
  });

  it('shows error notification when download fails', async () => {
    const notifyModule = (await import('utils/notify')).default;
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    mockDownloadMutateAsync.mockRejectedValue(new Error('fail'));
    setupSearchParams({ nav: 'NAV-001', cf: 'FISCAL-001', installment_id: '42' });
    render(<CourtesyPageActions />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.downloadCta'));

    await waitFor(() => {
      expect(notifyModule.emit).toHaveBeenCalledWith('Download error');
    });
  });
});
