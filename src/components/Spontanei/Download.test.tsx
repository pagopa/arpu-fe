import React from 'react';
import Download from './Download';
import utils from 'utils';
import { ROUTES } from 'routes/routes';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { render, screen, waitFor, fireEvent } from '__tests__/renderers';

const TRANSLATIONS = {
  'spontanei.download.title': 'Download in progress',
  'spontanei.download.help': 'If the download does not start <link1>click here</link1>',
  'spontanei.download.close': 'Close',
  'spontanei.download.info': 'Where to pay'
};

i18nTestSetup(TRANSLATIONS);

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
const mockAnonymousMutateAsync = vi.fn();
const mockExecuteRecaptcha = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ orgId: '123', nav: 'NAV000001' }),
    useLocation: () => ({ state: { debtorFiscalCode: 'RSSMRA80A01H501U' } })
  };
});

vi.mock('hooks/useAppRoutes', () => ({
  useAppRoutes: () => ({
    routes: {
      LOGIN: ROUTES.LOGIN,
      DASHBOARD: ROUTES.DASHBOARD
    },
    externalRoutes: {
      PAYMENT_LINKS: 'https://www.pagopa.gov.it/it/cittadini/dove-pagare/'
    }
  })
}));

vi.mock('utils', () => ({
  default: {
    loaders: {
      getPaymentNotice: vi.fn(() => ({ mutateAsync: mockMutateAsync })),
      public: {
        getPublicPaymentNotice: vi.fn(() => ({ mutateAsync: mockAnonymousMutateAsync }))
      }
    },
    files: {
      downloadBlob: vi.fn()
    },
    notify: {
      emit: vi.fn()
    },
    storage: {
      user: {
        isAnonymous: vi.fn(() => false)
      }
    }
  }
}));

vi.mock('utils/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils/storage')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      app: {
        ...actual.default?.app,
        getBrokerId: vi.fn(() => 'broker-42'),
        getBrokerCode: vi.fn(() => 'BROKER42')
      }
    }
  };
});

vi.mock('components/RecaptchaProvider/RecaptchaProvider', () => ({
  useRecaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha,
    isEnabled: true
  })
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockMutateAsync.mockResolvedValue({ data: new Blob(), filename: 'notice.pdf' });
  mockAnonymousMutateAsync.mockResolvedValue({ data: new Blob(), filename: 'notice.pdf' });
  mockExecuteRecaptcha.mockResolvedValue('test-recaptcha-token');
  (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(false);
});

describe('Download', () => {
  it('renders the title and all buttons', () => {
    render(<Download />);

    expect(screen.getByText('Download in progress')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Where to pay' })).toBeInTheDocument();
  });

  it('triggers authenticated download on mount', async () => {
    render(<Download />);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(utils.files.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'notice.pdf');
  });

  it('uses nav as fallback filename when server returns none', async () => {
    mockMutateAsync.mockResolvedValue({ data: new Blob(), filename: null });

    render(<Download />);

    await waitFor(() => {
      expect(utils.files.downloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'NAV000001.pdf');
    });
  });

  it('triggers anonymous download with recaptcha token when user is anonymous', async () => {
    (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<Download />);

    await waitFor(() => {
      expect(mockExecuteRecaptcha).toHaveBeenCalledTimes(1);
      expect(mockAnonymousMutateAsync).toHaveBeenCalledWith({
        recaptchaToken: 'test-recaptcha-token'
      });
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('does not call executeRecaptcha for authenticated user', async () => {
    render(<Download />);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockExecuteRecaptcha).not.toHaveBeenCalled();
    expect(mockMutateAsync).toHaveBeenCalledWith();
  });

  it('passes null recaptcha token when executeRecaptcha returns null', async () => {
    (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockExecuteRecaptcha.mockResolvedValue(null);

    render(<Download />);

    await waitFor(() => {
      expect(mockAnonymousMutateAsync).toHaveBeenCalledWith({ recaptchaToken: null });
      expect(utils.files.downloadBlob).toHaveBeenCalled();
    });
  });

  it('retries anonymous download with recaptcha on help link click', async () => {
    (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<Download />);

    await waitFor(() => {
      expect(mockAnonymousMutateAsync).toHaveBeenCalledTimes(1);
    });

    const retryLink = screen.getByText('click here');
    fireEvent.click(retryLink);

    await waitFor(() => {
      expect(mockExecuteRecaptcha).toHaveBeenCalledTimes(2);
      expect(mockAnonymousMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('shows notification on download error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('network error'));

    render(<Download />);

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith('qualcosa è andato storto');
    });
  });

  it('allows manual re-download via the help link', async () => {
    render(<Download />);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    const retryLink = screen.getByText('click here');
    fireEvent.click(retryLink);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('close link navigates to DASHBOARD for authenticated user', () => {
    render(<Download />);

    const closeLink = screen.getByRole('link', { name: 'Close' });

    expect(closeLink).toHaveAttribute('href', ROUTES.DASHBOARD);
  });

  it('close link navigates to LOGIN for anonymous user', () => {
    (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<Download />);

    const closeLink = screen.getByRole('link', { name: 'Close' });

    expect(closeLink).toHaveAttribute('href', ROUTES.LOGIN);
  });

  it('info link points to pagopa.gov.it', () => {
    render(<Download />);

    const infoLink = screen.getByRole('link', { name: 'Where to pay' });
    expect(infoLink).toHaveAttribute('href', 'https://www.pagopa.gov.it/it/cittadini/dove-pagare/');
    expect(infoLink).toHaveAttribute('target', '_blank');
  });
});
