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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ orgId: '123', nav: 'NAV000001' }),
    useLocation: () => ({ state: { debtorFiscalCode: 'RSSMRA80A01H501U' } })
  };
});

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

beforeEach(() => {
  vi.clearAllMocks();
  mockMutateAsync.mockResolvedValue({ data: new Blob(), filename: 'notice.pdf' });
  mockAnonymousMutateAsync.mockResolvedValue({ data: new Blob(), filename: 'notice.pdf' });
  (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(false);
});

describe('Download', () => {
  it('renders the title and all buttons', () => {
    render(<Download />);

    expect(screen.getByText('Download in progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
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

  it('triggers anonymous download when user is anonymous', async () => {
    (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<Download />);

    await waitFor(() => {
      expect(mockAnonymousMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
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

  it('navigates to DASHBOARD when authenticated user clicks close', () => {
    render(<Download />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it('navigates to LOGIN when anonymous user clicks close', () => {
    (utils.storage.user.isAnonymous as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<Download />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
  });

  it('info button links to pagopa.gov.it', () => {
    render(<Download />);

    const infoLink = screen.getByRole('link', { name: 'Where to pay' });
    expect(infoLink).toHaveAttribute('href', 'https://www.pagopa.gov.it/it/cittadini/dove-pagare/');
    expect(infoLink).toHaveAttribute('target', '_blank');
  });
});
