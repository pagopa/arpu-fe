/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, waitFor } from '__tests__/renderers';
import * as ReactRouterDom from 'react-router-dom';
import { ReceiptDownload } from './Download';

const mockMutateAsync = vi.fn();
const mockDownloadBlob = vi.fn();
const mockNotifyEmit = vi.fn();
const mockIsAnonymous = vi.fn();
const mockGetBrokerId = vi.fn();
const mockUseDownloadReceipt = vi.fn();
const mockUsePublicDownloadReceipt = vi.fn();

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
    useDownloadReceipt: (params?: any) => mockUseDownloadReceipt(params),
    public: {
      usePublicDownloadReceipt: (params?: any) => mockUsePublicDownloadReceipt(params)
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
      receiptId: '123',
      organizationId: '456'
    })),
    useLocation: vi.fn(() => ({
      state: { fiscalCode: 'RSSMRA80A01H501U' }
    }))
  };
});

vi.mock('routes/routes', () => ({
  ArcRoutes: {
    LOGIN: '/login',
    DASHBOARD: '/dashboard'
  },
  ExternalRoutes: {
    PAYMENT_LINKS: 'https://example.com/payment-links'
  }
}));

describe('ReceiptDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAnonymous.mockReturnValue(false);
    mockGetBrokerId.mockReturnValue(999);

    mockUseDownloadReceipt.mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    mockUsePublicDownloadReceipt.mockReturnValue({
      mutateAsync: mockMutateAsync
    });

    mockMutateAsync.mockResolvedValue({
      blob: new Blob(['test pdf content'], { type: 'application/pdf' }),
      filename: 'receipt_123.pdf'
    });
  });

  describe('Rendering', () => {
    it('renders all main elements', () => {
      render(<ReceiptDownload />);

      expect(screen.getByText('app.receipts.thankYou.title')).toBeInTheDocument();
      expect(screen.getByText('app.receipts.thankYou.subtitle')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toHaveAttribute(
        'src',
        '/cittadini/pictograms/hourglass.svg'
      );
      expect(screen.getByRole('link', { name: 'actions.close' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'app.receipts.thankYou.link' })).toBeInTheDocument();
    });

    it('renders close button with dashboard link for authenticated user', () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<ReceiptDownload />);

      const closeButton = screen.getByRole('link', { name: 'actions.close' });
      expect(closeButton).toHaveAttribute('href', '/dashboard');
    });

    it('renders close button with login link for anonymous user', () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<ReceiptDownload />);

      const closeButton = screen.getByRole('link', { name: 'actions.close' });
      expect(closeButton).toHaveAttribute('href', '/login');
    });
  });

  describe('Download functionality', () => {
    it('automatically downloads receipt on mount for authenticated user', async () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<ReceiptDownload />);

      await waitFor(() => {
        expect(mockUseDownloadReceipt).toHaveBeenCalledWith({ brokerId: 999 });
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: 'RSSMRA80A01H501U'
        });
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'receipt_123.pdf');
      });
    });

    it('automatically downloads receipt on mount for anonymous user', async () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<ReceiptDownload />);

      await waitFor(() => {
        expect(mockUsePublicDownloadReceipt).toHaveBeenCalledWith({ brokerId: 999 });
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: 'RSSMRA80A01H501U'
        });
      });
    });

    it('uses receiptId as filename when filename is not provided', async () => {
      mockMutateAsync.mockResolvedValue({
        blob: new Blob(['test content'], { type: 'application/pdf' }),
        filename: null
      });

      render(<ReceiptDownload />);

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), '123.pdf');
      });
    });

    it('shows error notification when download fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Download failed'));

      render(<ReceiptDownload />);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
        expect(mockDownloadBlob).not.toHaveBeenCalled();
      });
    });
  });

  describe('Parameter handling', () => {
    it('handles missing fiscalCode in location state', async () => {
      vi.spyOn(ReactRouterDom, 'useLocation').mockReturnValueOnce({
        state: null
      } as any);

      render(<ReceiptDownload />);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: undefined
        });
      });
    });

    it('converts string params to numbers', async () => {
      vi.spyOn(ReactRouterDom, 'useParams').mockReturnValueOnce({
        receiptId: '789',
        organizationId: '321'
      });

      render(<ReceiptDownload />);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 321,
          receiptId: 789,
          fiscalCode: 'RSSMRA80A01H501U'
        });
      });
    });
  });
});
