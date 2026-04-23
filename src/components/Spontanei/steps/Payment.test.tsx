import React from 'react';
import { render, screen, cleanup, fireEvent } from '__tests__/renderers';
import '@testing-library/jest-dom';
import Payment from './Payment';
import FormContext, { FormContextType } from '../FormContext';
import { Formik } from 'formik';
import { PaymentNoticeInfo } from '../index';
import {
  OrganizationsWithSpontaneousDTO,
  DebtPositionTypeOrgsWithSpontaneousDTO,
  PersonEntityType
} from '../../../../generated/data-contracts';
import { ROUTES } from 'routes/routes';
import * as CartStore from 'store/CartStore';
import notify from 'utils/notify';
import utils from 'utils';
import { Mock } from 'vitest';
import { setBrokerInfo } from 'store/appStore';

// Mock sub-components
vi.mock('../Controls', () => ({
  default: vi.fn(({ hideContinue }: { hideContinue?: boolean }) => (
    <div data-testid="controls-mock">{hideContinue ? 'Hidden' : 'Visible'}</div>
  ))
}));

// Mock reCAPTCHA
const mockExecuteRecaptcha = vi.fn();
const mockIsRecaptchaEnabled = vi.fn();

vi.mock('components/RecaptchaProvider/RecaptchaProvider', () => ({
  useRecaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha,
    isEnabled: mockIsRecaptchaEnabled()
  })
}));

// Mock store and hooks
const mockCart = { items: [] as never[] };
vi.mock('store/GlobalStore', () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useStore: vi.fn(() => ({
    state: { cart: mockCart },
    setState: vi.fn()
  }))
}));

const mockMutate = vi.fn();
vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: vi.fn((callbacks) => ({
    mutate: mockMutate,
    onSuccess: callbacks?.onSuccess,
    onError: callbacks?.onError
  }))
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => mockNavigate,
  Link: ({
    children,
    to,
    onClick,
    state,
    ...props
  }: {
    to: string;
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
    state?: { [key: string]: unknown };
  }) => (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
        mockNavigate(to, { state });
      }}
      {...props}>
      {children}
    </a>
  )
}));

// Mock icons
vi.mock('@mui/icons-material/FileDownload', () => ({ default: () => <span>DownloadIcon</span> }));
vi.mock('@mui/icons-material/ShoppingCart', () => ({ default: () => <span>CartIcon</span> }));

// Mock utils
vi.mock('utils', () => ({
  default: {
    storage: {
      user: { isAnonymous: vi.fn(() => false) },
      app: { getBrokerId: vi.fn(() => '1') }
    },
    loaders: {
      createSpontaneousDebtPosition: vi.fn(() => ({
        data: {
          organizationId: '123',
          orgFiscalCode: '12345678901',
          orgName: 'Test Org',
          paymentDetails: {
            iuv: 'IUV123',
            nav: 'NAV123',
            amountCents: 1000,
            remittanceInformation: 'Test Description'
          }
        }
      })),
      public: {
        createPublicSpontaneousDebtPosition: vi.fn(() => ({
          data: {
            organizationId: '123',
            orgFiscalCode: '12345678901',
            orgName: 'Test Org',
            paymentDetails: {
              iuv: 'IUV123',
              nav: 'NAV123',
              amountCents: 1000,
              remittanceInformation: 'Test Description'
            }
          }
        }))
      }
    },
    files: {
      generateDownloadUrl: vi.fn(({ orgId, nav, isAnonymous, fiscalCode }) => {
        const baseUrl = isAnonymous
          ? ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD
          : ROUTES.PAYMENTS_ON_THE_FLY_DOWNLOAD;
        const url = baseUrl.replace(':orgId', String(orgId)).replace(':nav', nav);
        return fiscalCode ? `${url}#debtorFiscalCode=${fiscalCode}` : url;
      })
    },
    notify: { emit: vi.fn() }
  }
}));

vi.mock('utils/notify', () => ({
  default: {
    emit: vi.fn(),
    dismiss: vi.fn()
  }
}));

// Mock Store functions
vi.mock('store/CartStore', () => ({
  addItem: vi.fn(),
  isItemInCart: vi.fn(() => false),
  setCartEmail: vi.fn(),
  toggleCartDrawer: vi.fn()
}));

const getDefaultContext = (overrides: Partial<FormContextType> = {}): FormContextType => ({
  step: { current: 4, previous: 3 },
  setStep: vi.fn(),
  omitFirstStep: false,
  setOmitFirstStep: vi.fn(),
  summaryFields: [],
  setSummaryFields: vi.fn(),
  submitFields: [],
  setSubmitFields: vi.fn(),
  causaleHasJoinTemplate: false,
  setCausaleHasJoinTemplate: vi.fn(),
  ...overrides
});

const initialValues: PaymentNoticeInfo = {
  org: {
    organizationId: 123,
    orgName: 'Test Org',
    orgFiscalCode: '12345678901'
  } as OrganizationsWithSpontaneousDTO,
  debtType: {
    debtPositionTypeOrgId: 456,
    organizationId: 123,
    code: 'DEBT_CODE',
    description: 'Test Debt Type'
  } as DebtPositionTypeOrgsWithSpontaneousDTO,
  fullName: 'Mario Rossi',
  fiscalCode: 'RSSMRA80A01H501U',
  entityType: PersonEntityType.F,
  amount: 10,
  description: 'Test Description',
  email: 'mario.rossi@example.com'
};

const renderPayment = (
  contextValue: Partial<FormContextType> = {},
  formikValues: Partial<PaymentNoticeInfo> = initialValues
) => {
  const defaultContext = getDefaultContext(contextValue);
  const mergedValues = { ...initialValues, ...formikValues } as PaymentNoticeInfo;
  return render(
    <Formik initialValues={mergedValues} onSubmit={vi.fn()}>
      <FormContext.Provider value={defaultContext}>
        <Payment />
      </FormContext.Provider>
    </Formik>
  );
};

describe('Payment Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecuteRecaptcha.mockResolvedValue('test-recaptcha-token');
    mockIsRecaptchaEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  setBrokerInfo(
    {
      brokerId: 1,
      brokerName: 'TestBrokerName',
      brokerFiscalCode: 'TestBrokerTaxCode',
      config: {
        translation: {},
        useCart: true
      },
      externalId: ''
    },
    'test'
  );

  it('renders correctly', () => {
    renderPayment();
    expect(screen.getByTestId('spontanei-step4-payment-container')).toBeInTheDocument();
    expect(screen.getByTestId('payment-methods-card')).toBeInTheDocument();
    expect(screen.getByTestId('download-notice-card')).toBeInTheDocument();
    expect(screen.getByTestId('add-to-cart-button')).toBeInTheDocument();
    expect(screen.getByTestId('pay-button')).toBeInTheDocument();
    expect(screen.getByTestId('download-notice-button')).toBeInTheDocument();
  });

  it('calls addItem and toggleCartDrawer when add to cart is clicked', async () => {
    renderPayment();
    const addToCartButton = screen.getByTestId('add-to-cart-button');
    fireEvent.click(addToCartButton);

    expect(CartStore.addItem).toHaveBeenCalledWith({
      amount: 1000,
      paTaxCode: '12345678901',
      paFullName: 'Test Org',
      iuv: 'IUV123',
      nav: 'NAV123',
      description: 'Test Description',
      allCCP: false
    });
    expect(CartStore.toggleCartDrawer).toHaveBeenCalled();
  });

  it('calls carts.mutate when pay is clicked', async () => {
    renderPayment();
    const payButton = screen.getByTestId('pay-button');
    fireEvent.click(payButton);

    expect(mockMutate).toHaveBeenCalledWith({
      notices: [
        {
          amount: 1000,
          nav: 'NAV123',
          iuv: 'IUV123',
          paTaxCode: '12345678901',
          paFullName: 'Test Org',
          description: 'Test Description',
          allCCP: false
        }
      ],
      email: 'mario.rossi@example.com'
    });
  });

  it('navigates to public download page when anonymous and download is clicked', async () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
    renderPayment();

    const downloadButton = screen.getByTestId('download-notice-button');
    fireEvent.click(downloadButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD.replace(':orgId', '123').replace(
        ':nav',
        'NAV123'
      ) + '#debtorFiscalCode=RSSMRA80A01H501U',
      { state: undefined }
    );
  });

  it('navigates to private download page when not anonymous and download is clicked', async () => {
    (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);
    renderPayment();

    const downloadButton = screen.getByTestId('download-notice-button');
    fireEvent.click(downloadButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      ROUTES.PAYMENTS_ON_THE_FLY_DOWNLOAD.replace(':orgId', '123').replace(':nav', 'NAV123') +
        '#debtorFiscalCode=RSSMRA80A01H501U',
      { state: undefined }
    );
  });

  it('shows error notification when cart is full', async () => {
    const { useStore } = await import('store/GlobalStore');
    (useStore as Mock).mockReturnValue({
      state: { cart: { items: [1, 2, 3, 4, 5] as unknown as never[] } },
      setState: vi.fn()
    });

    renderPayment();
    const addToCartButton = screen.getByTestId('add-to-cart-button');
    fireEvent.click(addToCartButton);

    expect(notify.emit).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(CartStore.addItem).not.toHaveBeenCalled();
  });

  describe('reCAPTCHA integration', () => {
    it('calls executeRecaptcha on mount for anonymous user when recaptcha is enabled', async () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
      mockIsRecaptchaEnabled.mockReturnValue(true);
      mockExecuteRecaptcha.mockResolvedValue('recaptcha-token-abc');

      renderPayment();

      await vi.waitFor(() => {
        expect(mockExecuteRecaptcha).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call executeRecaptcha for authenticated user', async () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);
      mockIsRecaptchaEnabled.mockReturnValue(true);

      renderPayment();

      expect(mockExecuteRecaptcha).not.toHaveBeenCalled();
    });

    it('does not call executeRecaptcha when recaptcha is disabled', async () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
      mockIsRecaptchaEnabled.mockReturnValue(false);

      renderPayment();

      expect(mockExecuteRecaptcha).not.toHaveBeenCalled();
    });

    it('passes recaptcha token to createPublicSpontaneousDebtPosition for anonymous user', async () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
      mockIsRecaptchaEnabled.mockReturnValue(true);
      mockExecuteRecaptcha.mockResolvedValue('recaptcha-token-abc');

      renderPayment();

      await vi.waitFor(() => {
        expect(utils.loaders.public.createPublicSpontaneousDebtPosition).toHaveBeenCalledWith(
          1,
          expect.any(Object),
          'recaptcha-token-abc'
        );
      });
    });

    it('passes undefined token to loader when executeRecaptcha fails', async () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
      mockIsRecaptchaEnabled.mockReturnValue(true);
      mockExecuteRecaptcha.mockRejectedValue(new Error('Recaptcha failed'));

      renderPayment();

      await vi.waitFor(() => {
        expect(utils.loaders.public.createPublicSpontaneousDebtPosition).toHaveBeenCalledWith(
          1,
          expect.any(Object),
          undefined
        );
      });
    });

    it('passes undefined token to loader when executeRecaptcha returns null', async () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(true);
      mockIsRecaptchaEnabled.mockReturnValue(true);
      mockExecuteRecaptcha.mockResolvedValue(null);

      renderPayment();

      await vi.waitFor(() => {
        expect(utils.loaders.public.createPublicSpontaneousDebtPosition).toHaveBeenCalledWith(
          1,
          expect.any(Object),
          undefined
        );
      });
    });

    it('uses createSpontaneousDebtPosition without token for authenticated user', () => {
      (utils.storage.user.isAnonymous as Mock).mockReturnValue(false);

      renderPayment();

      expect(utils.loaders.createSpontaneousDebtPosition).toHaveBeenCalledWith(
        1,
        expect.any(Object)
      );
      expect(utils.loaders.public.createPublicSpontaneousDebtPosition).not.toHaveBeenCalled();
    });
  });
});
