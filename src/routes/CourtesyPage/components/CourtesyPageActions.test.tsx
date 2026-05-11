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
    downloadBlob: vi.fn(),
    downloadReceipt: vi.fn(),
    generateDownloadUrl: vi.fn(({ orgId, nav, isAnonymous, fiscalCode }) => {
      const prefix = isAnonymous ? '/public/spontanei' : '/spontanei';
      const url = `${prefix}/download/${orgId ?? -1}/${nav ?? 'NAV'}`;
      return fiscalCode ? `${url}#debtorFiscalCode=${fiscalCode}` : url;
    })
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
      usePublicDownloadReceipt: vi.fn(() => ({
        mutateAsync: mockDownloadMutateAsync,
        isPending: false
      }))
    }
  }
}));

const CODE_424 = OUTCOMES['pagamento-non-riuscito'];
const CODE_425 = OUTCOMES['pagamento-annullato'];
const CODE_420 = OUTCOMES['pagamento-avviso-completato'];

i18nTestSetup({
  courtesyPage: {
    [CODE_424]: {
      cta: 'Retry',
      downloadCta: 'Download notice'
    },
    [CODE_425]: {
      cta: 'Back to home',
      downloadCta: 'Download notice'
    },
    [CODE_420]: {
      cta: 'Download receipt',
      secondaryCta: 'Back to home'
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
  receiptId: 555,
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
  receiptId: 777,
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

  it('generates correct filename in the link when server returns no filename', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('NAV-001'));
  });

  it('navigates to sconosciuto when retry is clicked before installment is resolved', () => {
    mockInstallmentsMutateAsync.mockReturnValue(new Promise(() => {}));
    setupSearchParams({
      nav: 'NAV-001',
      org_fiscal_code: 'ORG-FC-001',
      installment_id: '42'
    });

    render(<CourtesyPageActions code={CODE_424} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto']))
    );
  });

  it('renders the download link as anonymous on the 424 outcome', async () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({
      nav: 'NAV-001',
      org_fiscal_code: 'ORG-FC-001',
      installment_id: '42'
    });

    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('/public/spontanei/download/99/NAV-001')
    );
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
      expect.stringContaining(
        '/public/spontanei/download/99/NAV-001#debtorFiscalCode=DEBTOR-FC-001'
      )
    );
  });
});
describe('CourtesyPageActions – pagamento-avviso-completato (420)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the download-receipt CTA and the back-to-home secondary CTA', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    expect(screen.getByTestId('courtesyPage.cta')).toHaveTextContent('Download receipt');
    expect(screen.getByTestId('courtesyPage.secondaryCta')).toHaveTextContent('Back to home');
  });

  it('does NOT render the notice-download link (downloadCta) on the 420 outcome', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('courtesyPage.downloadCta')).not.toBeInTheDocument();
  });

  it('secondary CTA points to the LOGIN route', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    expect(screen.getByTestId('courtesyPage.secondaryCta')).toHaveAttribute('href', ROUTES.LOGIN);
  });

  it('disables the download-receipt CTA until the installment is loaded', () => {
    mockInstallmentsMutateAsync.mockReturnValue(new Promise(() => {}));
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    expect(screen.getByTestId('courtesyPage.cta')).toBeDisabled();
  });

  it('enables the download-receipt CTA after the installment is loaded', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(screen.getByTestId('courtesyPage.cta')).not.toBeDisabled();
    });
  });

  it('calls downloadReceipt with installment data when the CTA is clicked', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(screen.getByTestId('courtesyPage.cta')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(utils.files.downloadReceipt).toHaveBeenCalledWith(mockDownloadMutateAsync, {
      organizationId: 99,
      receiptId: 555,
      fiscalCode: 'DEBTOR-FC-001'
    });
  });

  it('finds the correct installment by installment_id among multiple results', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_OTHER, INSTALLMENT_MATCH]);
    setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(screen.getByTestId('courtesyPage.cta')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(utils.files.downloadReceipt).toHaveBeenCalledWith(
      mockDownloadMutateAsync,
      expect.objectContaining({ receiptId: 555, organizationId: 99 })
    );
  });

  it('throws when nav is missing', () => {
    setupSearchParams({ org_fiscal_code: 'ORG-FC-001', installment_id: '42' });

    expect(() => render(<CourtesyPageActions code={CODE_420} />)).toThrow(
      'Missing required query params: nav, org_fiscal_code or brokerId'
    );
  });

  it('throws when org_fiscal_code is missing', () => {
    setupSearchParams({ nav: 'NAV-001', installment_id: '42' });

    expect(() => render(<CourtesyPageActions code={CODE_420} />)).toThrow(
      'Missing required query params: nav, org_fiscal_code or brokerId'
    );
  });
});
