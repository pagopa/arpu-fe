/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, waitFor } from '__tests__/renderers';
import * as ReactRouterDom from 'react-router-dom';
import { DebtPositionDownload } from '../download';

const mockMutateAsync = vi.fn();
const mockDownloadBlob = vi.fn();
const mockNotifyEmit = vi.fn();
const mockIsAnonymous = vi.fn();
const mockGetBrokerId = vi.fn();
const mockGetPaymentNotice = vi.fn();
const mockGetPublicPaymentNotice = vi.fn();
const mockExecuteRecaptcha = vi.fn();

vi.mock('utils/storage', () => ({
  default: {
    user: {
      isAnonymous: () => mockIsAnonymous()
    },
    app: {
      getBrokerId: () => mockGetBrokerId()
    }
  },
  SessionItems: {
    CART: 'CART',
    OPTIN: 'OPTIN'
  },
  StorageItems: {
    TOKEN: 'ARPU-accessToken',
    BROKERID: 'ARPU-brokerId'
  }
}));

vi.mock('utils/loaders', () => ({
  default: {
    getPaymentNotice: (...args: any[]) => mockGetPaymentNotice(...args),
    public: {
      getPublicPaymentNotice: (...args: any[]) => mockGetPublicPaymentNotice(...args)
    }
  }
}));

vi.mock('utils/files', () => ({
  default: {
    downloadBlob: (blob: Blob, filename: string) => mockDownloadBlob(blob, filename)
  }
}));

vi.mock('utils/notify', () => ({
  default: {
    emit: (msg: string) => mockNotifyEmit(msg)
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({
      nav: 'NAV123',
      orgId: '456'
    })),
    useLocation: vi.fn(() => ({
      state: { fiscalCode: 'RSSMRA80A01H501U' }
    }))
  };
});

vi.mock('routes/routes', () => ({
  ROUTES: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard'
  },
  ExternalRoutes: {
    PAYMENT_LINKS: 'https://example.com/payment-links'
  }
}));

vi.mock('components/RecaptchaProvider/RecaptchaProvider', () => ({
  useRecaptcha: () => ({
    executeRecaptcha: mockExecuteRecaptcha,
    isEnabled: true
  })
}));

describe('DebtPositionDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAnonymous.mockReturnValue(false);
    mockGetBrokerId.mockReturnValue(999);

    mockGetPaymentNotice.mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    mockGetPublicPaymentNotice.mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    mockMutateAsync.mockResolvedValue({
      data: new Blob(['test pdf content'], { type: 'application/pdf' }),
      filename: 'receipt_IUV123.pdf'
    });

    mockExecuteRecaptcha.mockResolvedValue('test-recaptcha-token');
  });

  describe('Rendering', () => {
    it('renders all main elements', () => {
      render(<DebtPositionDownload />);

      expect(screen.getByText('app.debtPositions.download.title')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toHaveAttribute(
        'src',
        '/cittadini/pictograms/hourglass.svg'
      );
      expect(screen.getByRole('link', { name: 'actions.close' })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'app.debtPositions.download.link' })
      ).toBeInTheDocument();
    });

    it('renders close button with dashboard link for authenticated user', () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<DebtPositionDownload />);

      const closeButton = screen.getByRole('link', { name: 'actions.close' });
      expect(closeButton).toHaveAttribute('href', '/dashboard');
    });

    it('renders close button with login link for anonymous user', () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<DebtPositionDownload />);

      const closeButton = screen.getByRole('link', { name: 'actions.close' });
      expect(closeButton).toHaveAttribute('href', '/login');
    });
  });

  describe('Download functionality', () => {
    it('automatically downloads receipt on mount for authenticated user', async () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<DebtPositionDownload />);

      await waitFor(() => {
        expect(mockGetPaymentNotice).toHaveBeenCalledWith(
          999,
          456,
          { nav: 'NAV123' },
          'RSSMRA80A01H501U'
        );
        expect(mockMutateAsync).toHaveBeenCalledWith();
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'receipt_IUV123.pdf');
      });
    });

    it('automatically downloads receipt on mount for anonymous user with recaptcha token', async () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<DebtPositionDownload />);

      await waitFor(() => {
        expect(mockGetPublicPaymentNotice).toHaveBeenCalledWith(
          999,
          456,
          { nav: 'NAV123' },
          'RSSMRA80A01H501U'
        );
        expect(mockExecuteRecaptcha).toHaveBeenCalledTimes(1);
        expect(mockMutateAsync).toHaveBeenCalledWith({ recaptchaToken: 'test-recaptcha-token' });
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'receipt_IUV123.pdf');
      });
    });

    it('does not call executeRecaptcha for authenticated user', async () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<DebtPositionDownload />);

      await waitFor(() => {
        expect(mockExecuteRecaptcha).not.toHaveBeenCalled();
        expect(mockMutateAsync).toHaveBeenCalledWith();
      });
    });

    it('passes null recaptcha token when executeRecaptcha returns null', async () => {
      mockIsAnonymous.mockReturnValue(true);
      mockExecuteRecaptcha.mockResolvedValue(null);
      render(<DebtPositionDownload />);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({ recaptchaToken: null });
        expect(mockDownloadBlob).toHaveBeenCalled();
      });
    });

    it('uses iuv as filename when filename is not provided', async () => {
      mockMutateAsync.mockResolvedValue({
        data: new Blob(['test content'], { type: 'application/pdf' }),
        filename: null
      });

      render(<DebtPositionDownload />);

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'NAV123.pdf');
      });
    });

    it('shows error notification when download fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Download failed'));

      render(<DebtPositionDownload />);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.file');
        expect(mockDownloadBlob).not.toHaveBeenCalled();
      });
    });
  });

  describe('Required parameters guard', () => {
    it('throws when organizationId is missing', () => {
      vi.spyOn(ReactRouterDom, 'useParams').mockReturnValue({
        nav: 'NAV123',
        organizationId: undefined
      });

      expect(() => render(<DebtPositionDownload />)).toThrow('Missing required parameters');
    });

    it('throws when nav is missing', () => {
      vi.spyOn(ReactRouterDom, 'useParams').mockReturnValue({
        nav: undefined,
        organizationId: '456'
      });

      expect(() => render(<DebtPositionDownload />)).toThrow('Missing required parameters');
    });

    it('throws when fiscalCode is missing from location state', () => {
      vi.spyOn(ReactRouterDom, 'useLocation').mockReturnValue({
        state: null
      } as any);

      expect(() => render(<DebtPositionDownload />)).toThrow('Missing required parameters');
    });

    it('throws when brokerId is missing', () => {
      mockGetBrokerId.mockReset();
      mockGetBrokerId.mockReturnValue(undefined);

      expect(() => render(<DebtPositionDownload />)).toThrow('Missing required parameters');
    });
  });
});
