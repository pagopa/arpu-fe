/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { CourtesyPageActions } from './CourtesyPageActions';
import { OUTCOMES, ROUTES } from 'routes/routes';
import { useSearchParams } from 'react-router-dom';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { render } from '__tests__/renderers';
import utils from 'utils';
import { Mock } from 'vitest';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useSearchParams: vi.fn(),
    useNavigate: () => mockNavigate,
    Link: ({ children, to, state, onClick, ...props }: any) => (
      <a
        href={to}
        onClick={(e) => {
          if (onClick) onClick(e);
          if (!e.defaultPrevented) {
            mockNavigate(to, { state });
          }
        }}
        {...props}>
        {children}
      </a>
    )
  };
});

const mockPostCartsMutate = vi.fn();
const mockInstallmentsMutateAsync = vi.fn();
const mockDownloadMutateAsync = vi.fn();
const mockExecuteRecaptcha = vi.fn();

vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: (opts: { onSuccess: (url: string) => void; onError: () => void }) => ({
    mutate: (...args: unknown[]) => {
      mockPostCartsMutate(...args);
      opts.onSuccess('https://checkout.test');
    },
    isPending: false
  })
}));

vi.mock('components/RecaptchaProvider/RecaptchaProvider', () => ({
  useRecaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha
  })
}));

vi.mock('utils/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils/storage')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      app: {
        ...(actual.default as any).app,
        getBrokerId: vi.fn(() => 'broker-123'),
        getBrokerCode: vi.fn(() => 'BROKER-CODE-123')
      },
      user: {
        isAnonymous: vi.fn(() => false)
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

  it('throws when nav is missing', () => {
    setupSearchParams({ org_fiscal_code: 'ORG-FC-001', installment_id: '42' });

    expect(() => render(<CourtesyPageActions code={CODE_424} />)).toThrow(
      'Missing required query params: nav, org_fiscal_code or brokerId'
    );
  });

  it('throws when org_fiscal_code is missing', () => {
    setupSearchParams({ nav: 'NAV-001', installment_id: '42' });

    expect(() => render(<CourtesyPageActions code={CODE_424} />)).toThrow(
      'Missing required query params: nav, org_fiscal_code or brokerId'
    );
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

  it('navigates to error page when retry is clicked after fetch failure', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('Network error'));
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto']))
    );
  });

  it('renders correct download link with correct attributes', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('/spontanei/download/99/NAV-001')
    );
  });

  // Test for download failure is no longer applicable here as download logic moved to Download component.
  // Instead, verify that the link is still valid even if fetch fails (it uses defaults)
  it('renders download link using defaults when installment fetch fails', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('fail'));
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('/download/-1'));
  });

  it('shows error notification when recaptcha fails', async () => {
    const notifyModule = (await import('utils/notify')).default;
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    mockExecuteRecaptcha.mockRejectedValue(new Error('recaptcha failed'));
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.downloadCta'));

    await waitFor(() => {
      expect(mockDownloadMutateAsync).not.toHaveBeenCalled();
      expect(notifyModule.emit).toHaveBeenCalledWith('Download error');
    });
  });

  it('selects the only installment when installment_id is absent', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001' });
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
          paTaxCode: 'ORG-FC-001'
        })
      ]
    });
  });

  it('selects the only installment even when installment_id does not match', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({
      nav: 'NAV-001',
      org_fiscal_code: 'ORG-FC-001',
      installment_id: '999'
    });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('courtesyPage.cta'));
      expect(mockPostCartsMutate).toHaveBeenCalledWith({
        notices: [expect.objectContaining({ nav: 'NAV-001' })]
      });
    });
  });

  it('navigates to sconosciuto when installment_id matches nothing in multiple results', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH, INSTALLMENT_OTHER]);
    setupSearchParams({
      nav: 'NAV-001',
      org_fiscal_code: 'ORG-FC-001',
      installment_id: '777'
    });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto']))
    );
  });

  it('generates correct filename in the link when server returns no filename (not directly relevant but kept for logic check)', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('NAV-001'));
  });
});

describe('CourtesyPageActions – pagamento-annullato (425)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders "Back to home" CTA as a link to login', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    const cta = screen.getByTestId('courtesyPage.cta');
    expect(cta).toHaveTextContent('Back to home');
    expect(cta).toHaveAttribute('href', ROUTES.LOGIN);
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

  it('renders correct download link for cancelled payment', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('/spontanei/download/99/NAV-001')
    );
  });

  it('renders correct download link for cancelled payment when the user is not logged in', async () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('/spontanei/download/99/NAV-001#debtorFiscalCode=DEBTOR-FC-001')
    );
  });

  // Test for download failure removed as download moved to Download component.
  it('renders download link using defaults when fetch fails for cancelled payment', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('fail'));
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_425} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('/download/-1'));
  });
});
