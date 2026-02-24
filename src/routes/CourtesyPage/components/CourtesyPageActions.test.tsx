import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { CourtesyPageActions } from './CourtesyPageActions';
import { OUTCOMES, ROUTES } from 'routes/routes';

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

const CODE_424 = OUTCOMES['pagamento-non-riuscito'];
const CODE_425 = OUTCOMES['pagamento-annullato'];

i18nTestSetup({
  courtesyPage: {
    [CODE_424]: {
      cta: 'Retry',
      downloadCta: 'Download notice'
    },
    [CODE_425]: {
      cta: 'Back to home',
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
  orgFiscalCode: 'ORG-FC-001',
  orgName: 'Test Org',
  organizationId: 99,
  debtor: { fiscalCode: 'DEBTOR-FC-001' }
};

const INSTALLMENT_OTHER = {
  installmentId: 99,
  iuv: 'IUV-OTHER',
  nav: 'NAV-OTHER',
  amountCents: 5000,
  remittanceInformation: 'Other payment',
  orgFiscalCode: 'ORG-FC-OTHER',
  orgName: 'Other Org',
  organizationId: 50,
  debtor: { fiscalCode: 'DEBTOR-FC-OTHER' }
};

const setupSearchParams = (params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams(params);
  vi.mocked(useSearchParams).mockReturnValue([searchParams, vi.fn()]);
};

describe('CourtesyPageActions – pagamento-non-riuscito (424)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the retry and download buttons', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    expect(screen.getByTestId('courtesyPage.cta')).toHaveTextContent('Retry');
    expect(screen.getByTestId('courtesyPage.downloadCta')).toHaveTextContent('Download notice');
  });

  it('fetches installments on mount when required params are present', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalledWith({
        iuvOrNav: 'NAV-001',
        orgFiscalCode: 'ORG-FC-001'
      });
    });
  });

  it('does not fetch installments when nav is missing', () => {
    setupSearchParams({ org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    expect(mockInstallmentsMutateAsync).not.toHaveBeenCalled();
  });

  it('does not fetch installments when org_fiscal_code is missing', () => {
    setupSearchParams({ nav: 'NAV-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    expect(mockInstallmentsMutateAsync).not.toHaveBeenCalled();
  });

  it('finds the correct installment by installment_id', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_OTHER, INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).toHaveBeenCalledWith({
      notices: [
        expect.objectContaining({
          nav: 'NAV-001',
          iuv: 'IUV-001',
          paTaxCode: 'ORG-FC-001',
          paFullName: 'Test Org',
          description: 'Test payment',
          amount: 10000
        })
      ]
    });
  });

  it('does not call postCarts when installment is not resolved (no match)', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_OTHER]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('sets installment to null when fetch fails', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('Network error'));
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

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
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

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
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.downloadCta'));

    await waitFor(() => {
      expect(notifyModule.emit).toHaveBeenCalledWith('Download error');
    });
  });
});

describe('CourtesyPageActions – pagamento-annullato (425)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders "Back to home" CTA as a link to DASHBOARD', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    const cta = screen.getByTestId('courtesyPage.cta');
    expect(cta).toHaveTextContent('Back to home');
    expect(cta).toHaveAttribute('href', ROUTES.DASHBOARD);
  });

  it('renders the download button', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    expect(screen.getByTestId('courtesyPage.downloadCta')).toHaveTextContent('Download notice');
  });

  it('does NOT render a retry button (no postCarts call on CTA click)', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('fetches installments on mount and resolves the correct one', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_OTHER, INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalledWith({
        iuvOrNav: 'NAV-001',
        orgFiscalCode: 'ORG-FC-001'
      });
    });
  });

  it('calls downloadBlob on successful download', async () => {
    const filesModule = (await import('utils/files')).default;
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    mockDownloadMutateAsync.mockResolvedValue({ data: new Blob(), filename: 'avviso.pdf' });
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.downloadCta'));

    await waitFor(() => {
      expect(mockDownloadMutateAsync).toHaveBeenCalled();
      expect(filesModule.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'avviso.pdf');
    });
  });
});
