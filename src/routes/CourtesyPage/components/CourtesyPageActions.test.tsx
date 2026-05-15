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
const mockResetCart = vi.fn();

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
        isAnonymous: vi.fn(() => true)
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

const mockCartState = {
  cart: {
    items: [] as Array<{
      paFullName: string;
      description: string;
      amount: number;
      iuv: string;
      nav: string;
      paTaxCode: string;
      allCCP: boolean;
    }>,
    email: undefined as string | undefined,
    amount: 0,
    isOpen: false
  }
};

vi.mock('store/GlobalStore', () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useStore: () => ({ state: mockCartState, setState: vi.fn() })
}));

vi.mock('store/CartStore', () => ({
  resetCart: (...args: unknown[]) => mockResetCart(...args)
}));

const CODE_420 = OUTCOMES['pagamento-avviso-completato'];
const CODE_424 = OUTCOMES['pagamento-non-riuscito'];
const CODE_425 = OUTCOMES['pagamento-annullato'];

i18nTestSetup({
  courtesyPage: {
    [CODE_420]: {
      cta: 'Download receipt',
      secondaryCta: 'Back to home',
      auth: {
        homeCta: 'Back to home'
      }
    },
    [CODE_424]: {
      cta: 'Retry',
      downloadCta: 'Download notice',
      homeCta: 'Back to home'
    },
    [CODE_425]: {
      cta: 'Back to home',
      downloadCta: 'Download notice',
      homeCta: 'Back to home'
    },
    default: {
      homeCta: 'Back to home'
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

const setAnonymous = (value: boolean) => {
  (utils.storage.user.isAnonymous as Mock).mockReturnValue(value);
};

const setCartItems = (items: typeof mockCartState.cart.items, email?: string) => {
  mockCartState.cart.items = items;
  mockCartState.cart.email = email;
  mockCartState.cart.amount = items.reduce((sum, i) => sum + i.amount, 0);
};

const CART_ITEM_1 = {
  paFullName: 'ACI',
  description: 'Bollo',
  amount: 12345,
  iuv: 'IUV-CART-1',
  nav: 'NAV-CART-1',
  paTaxCode: 'TAX-1',
  allCCP: true
};

const CART_ITEM_2 = {
  paFullName: 'Comune',
  description: 'TARI',
  amount: 6789,
  iuv: 'IUV-CART-2',
  nav: 'NAV-CART-2',
  paTaxCode: 'TAX-2',
  allCCP: false
};

beforeEach(() => {
  setCartItems([]);
  setupSearchParams({ nav: 'NAV-001', org_fiscal_code: 'ORG-FC-001', installment_id: '42' });
});

afterEach(() => vi.clearAllMocks());

describe('CourtesyPageActions – dispatcher', () => {
  it('renders the anonymous branch when isAnonymous is true', () => {
    setAnonymous(true);
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    render(<CourtesyPageActions code={CODE_424} />);

    expect(screen.getByTestId('courtesyPage.downloadCta')).toBeInTheDocument();
    expect(screen.queryByTestId('courtesyPage.homeCta')).not.toBeInTheDocument();
  });

  it('renders the authenticated branch when isAnonymous is false', () => {
    setAnonymous(false);
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_424} />);
    expect(screen.getByTestId('courtesyPage.homeCta')).toBeInTheDocument();
    expect(screen.queryByTestId('courtesyPage.downloadCta')).not.toBeInTheDocument();
  });
});

describe('CourtesyPageActions – pagamento-non-riuscito (424), anonymous', () => {
  beforeEach(() => setAnonymous(true));

  it('renders the retry and download buttons', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    render(<CourtesyPageActions code={CODE_424} />);

    expect(screen.getByTestId('courtesyPage.cta')).toHaveTextContent('Retry');
    expect(screen.getByTestId('courtesyPage.downloadCta')).toHaveTextContent('Download notice');
  });

  it('fetches installments on mount when required params are present', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
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

  it('renders correct download link as anonymous', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('/public/spontanei/download/99/NAV-001')
    );
  });

  it('renders download link using defaults when installment fetch fails', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('fail'));
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockInstallmentsMutateAsync).toHaveBeenCalled();
    });

    const downloadLink = screen.getByTestId('courtesyPage.downloadCta');
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('/download/-1'));
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

  it('navigates to sconosciuto when retry is clicked before installment is resolved', () => {
    mockInstallmentsMutateAsync.mockReturnValue(new Promise(() => {}));
    render(<CourtesyPageActions code={CODE_424} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      ROUTES.public.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto']))
    );
  });
});

describe('CourtesyPageActions – pagamento-annullato (425), anonymous', () => {
  beforeEach(() => setAnonymous(true));

  it('renders "Back to home" CTA as a link to login', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    render(<CourtesyPageActions code={CODE_425} />);

    const cta = screen.getByTestId('courtesyPage.cta');
    expect(cta).toHaveTextContent('Back to home');
    expect(cta).toHaveAttribute('href', ROUTES.LOGIN);
  });

  it('renders the download button', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    render(<CourtesyPageActions code={CODE_425} />);

    expect(screen.getByTestId('courtesyPage.downloadCta')).toHaveTextContent('Download notice');
  });

  it('does NOT trigger a retry on CTA click (no postCarts call)', () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
    render(<CourtesyPageActions code={CODE_425} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('renders correct download link for cancelled payment', async () => {
    mockInstallmentsMutateAsync.mockResolvedValue([INSTALLMENT_MATCH]);
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
  beforeEach(() => setAnonymous(true));
  afterEach(() => vi.clearAllMocks());

  it('renders download receipt CTA and Back to home secondary CTA on the 420 outcome', async () => {
    mockInstallmentsMutateAsync.mockRejectedValue(new Error('fail'));
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

describe('CourtesyPageActions – pagamento-non-riuscito (424), authenticated', () => {
  beforeEach(() => setAnonymous(false));

  it('renders both Retry and Back to home buttons', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_424} />);

    expect(screen.getByTestId('courtesyPage.cta')).toHaveTextContent('Retry');
    expect(screen.getByTestId('courtesyPage.homeCta')).toHaveTextContent('Back to home');
    expect(screen.queryByTestId('courtesyPage.downloadCta')).not.toBeInTheDocument();
  });

  it('does NOT call the public installments endpoint', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_424} />);

    expect(mockInstallmentsMutateAsync).not.toHaveBeenCalled();
  });

  it('clicking Retry submits the current cart items as-is', () => {
    setCartItems([CART_ITEM_1, CART_ITEM_2], 'me@example.com');
    render(<CourtesyPageActions code={CODE_424} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).toHaveBeenCalledWith({
      notices: [CART_ITEM_1, CART_ITEM_2],
      email: 'me@example.com'
    });
  });

  it('passes email=undefined when the cart has no email', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_424} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockPostCartsMutate).toHaveBeenCalledWith({
      notices: [CART_ITEM_1],
      email: undefined
    });
  });

  it('redirects to sconosciuto when the cart is empty', async () => {
    setCartItems([]);
    render(<CourtesyPageActions code={CODE_424} />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        ROUTES.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto']))
      );
    });
  });

  it('the Back to home button points to the DASHBOARD route', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_424} />);

    expect(screen.getByTestId('courtesyPage.homeCta')).toHaveAttribute('href', ROUTES.DASHBOARD);
  });

  it('does NOT reset the cart on KO (allows multiple retries)', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_424} />);

    fireEvent.click(screen.getByTestId('courtesyPage.cta'));

    expect(mockResetCart).not.toHaveBeenCalled();
  });
});

describe('CourtesyPageActions – pagamento-annullato (425), authenticated', () => {
  beforeEach(() => setAnonymous(false));

  it('renders only the Back to home button (no Retry, no download)', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_425} />);

    expect(screen.queryByTestId('courtesyPage.cta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('courtesyPage.downloadCta')).not.toBeInTheDocument();
    const homeCta = screen.getByTestId('courtesyPage.homeCta');
    expect(homeCta).toHaveTextContent('Back to home');
    expect(homeCta).toHaveAttribute('href', ROUTES.DASHBOARD);
  });

  it('does NOT call postCarts on any click', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_425} />);

    fireEvent.click(screen.getByTestId('courtesyPage.homeCta'));

    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('redirects to sconosciuto when the cart is empty', async () => {
    setCartItems([]);
    render(<CourtesyPageActions code={CODE_425} />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        ROUTES.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto']))
      );
    });
  });

  it('does NOT reset the cart on CANCEL (user may still go back and pay)', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_425} />);

    expect(mockResetCart).not.toHaveBeenCalled();
  });
});

describe('CourtesyPageActions – pagamento-avviso-completato (420), authenticated', () => {
  beforeEach(() => setAnonymous(false));

  it('renders only the Back to home button (no Retry, no download)', () => {
    setCartItems([CART_ITEM_1]);
    render(<CourtesyPageActions code={CODE_420} />);

    expect(screen.queryByTestId('courtesyPage.cta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('courtesyPage.downloadCta')).not.toBeInTheDocument();
    const homeCta = screen.getByTestId('courtesyPage.homeCta');
    expect(homeCta).toHaveTextContent('Back to home');
    expect(homeCta).toHaveAttribute('href', ROUTES.DASHBOARD);
  });

  it('resets the cart on mount when the cart was not empty', async () => {
    setCartItems([CART_ITEM_1, CART_ITEM_2]);
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(mockResetCart).toHaveBeenCalledTimes(1);
    });
  });

  it('does NOT call resetCart when the cart is already empty', async () => {
    setCartItems([]);
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(screen.getByTestId('courtesyPage.homeCta')).toBeInTheDocument();
    });

    expect(mockResetCart).not.toHaveBeenCalled();
  });

  it('does NOT redirect to sconosciuto when the cart is empty (OK is not a retryable outcome)', async () => {
    setCartItems([]);
    render(<CourtesyPageActions code={CODE_420} />);

    await waitFor(() => {
      expect(screen.getByTestId('courtesyPage.homeCta')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
