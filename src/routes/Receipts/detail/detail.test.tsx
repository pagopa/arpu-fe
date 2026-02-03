/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../__tests__/renderers';
import { ReceiptDetail } from '.';
import * as ReactRouterDom from 'react-router-dom';

const mockReceiptData = {
  receiptId: 123,
  organizationId: 456,
  orgFiscalCode: '12345678901',
  orgName: 'Test Organization',
  paymentAmountCents: 150000,
  paymentDateTime: '2024-11-15T14:30:00Z',
  receiptOrigin: 'PAYMENT_NOTICE' as const,
  installmentId: 1,
  remittanceInformation: 'Payment for service ABC',
  debtPositionTypeOrgDescription: 'Municipal Tax Payment',
  debtPositionTypeDescription: 'Tax',
  serviceType: 'Standard',
  iuv: '123456789012345678',
  iur: 'IUR123456789',
  iud: 'IUD987654321',
  pspCompanyName: 'Test Payment Provider',
  debtor: {
    fullName: 'Mario Rossi',
    fiscalCode: 'RSSMRA80A01H501U'
  }
};

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
const mockDownloadBlob = vi.fn();
const mockNotifyEmit = vi.fn();
const mockIsAnonymous = vi.fn();
const mockUseReceiptDetail = vi.fn();
const mockUsePublicReceiptDetail = vi.fn();

vi.mock('utils', () => ({
  default: {
    storage: {
      user: {
        isAnonymous: () => mockIsAnonymous()
      }
    },
    style: {
      theme: {
        spacing: vi.fn()
      }
    }
  }
}));

vi.mock('utils/loaders', () => ({
  default: {
    useReceiptDetail: (params?: any) => mockUseReceiptDetail(params),
    useDownloadReceipt: () => ({ mutateAsync: mockMutateAsync }),
    public: {
      usePublicReceiptDetail: (params?: any) => mockUsePublicReceiptDetail(params),
      usePublicDownloadReceipt: () => ({ mutateAsync: mockMutateAsync })
    }
  }
}));

vi.mock('utils/config', () => ({
  default: {
    brokerId: '999'
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
    })),
    useNavigate: () => mockNavigate
  };
});

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

vi.mock('components/DataRow', () => ({
  DataRow: ({ label, value }: any) => (
    <tr data-testid="data-row">
      <td data-testid="data-row-label">{label}</td>
      <td data-testid="data-row-value">{value}</td>
    </tr>
  )
}));

vi.mock('components/CopiableRow', () => ({
  CopiableRow: ({ label, value, copiable }: any) => (
    <div data-testid="copiable-row">
      <span data-testid="copiable-row-label">{label}</span>
      <span data-testid="copiable-row-value">{value}</span>
      {copiable && <button data-testid="copy-button">Copy</button>}
    </div>
  )
}));

describe('ReceiptDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAnonymous.mockReturnValue(false);

    mockUseReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    });

    mockUsePublicReceiptDetail.mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    });

    mockMutateAsync.mockResolvedValue({
      blob: new Blob(['test pdf content'], { type: 'application/pdf' }),
      filename: 'receipt_123.pdf'
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockIsAnonymous.mockReturnValue(false);
    });

    it('renders without crashing', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
    });

    it('renders page title', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
    });

    it('renders download button at top for authenticated user', () => {
      render(<ReceiptDetail />);
      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      expect(downloadButton).toBeInTheDocument();
    });

    it('does not render subtitle for authenticated user', () => {
      render(<ReceiptDetail />);
      expect(screen.queryByText('app.receiptDetail.subtitle')).not.toBeInTheDocument();
    });

    it('does not render back button for authenticated user', () => {
      render(<ReceiptDetail />);
      expect(screen.queryByText('app.routes.back')).not.toBeInTheDocument();
    });

    it('calls useReceiptDetail with correct parameters including fiscalCode', () => {
      render(<ReceiptDetail />);

      expect(mockUseReceiptDetail).toHaveBeenCalledWith({
        brokerId: 999,
        organizationId: 456,
        receiptId: 123,
        fiscalCode: 'RSSMRA80A01H501U'
      });
    });

    it('downloads receipt when download button is clicked', async () => {
      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: 'RSSMRA80A01H501U'
        });
      });

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'receipt_123.pdf');
      });
    });
  });

  describe('Anonymous User', () => {
    beforeEach(() => {
      mockIsAnonymous.mockReturnValue(true);
    });

    it('renders subtitle for anonymous user', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.subtitle')).toBeInTheDocument();
    });

    it('renders back button for anonymous user', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.routes.back')).toBeInTheDocument();
    });

    it('renders download button at bottom for anonymous user', () => {
      render(<ReceiptDetail />);
      const downloadButtons = screen.getAllByRole('button', { name: 'app.receiptDetail.download' });
      // Should only have one download button at the bottom
      expect(downloadButtons).toHaveLength(1);
    });

    it('uses public download endpoint for anonymous user', async () => {
      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: 'RSSMRA80A01H501U'
        });
      });
    });

    it('navigates back when back button is clicked', () => {
      render(<ReceiptDetail />);

      const backButton = screen.getByRole('button', { name: 'app.routes.back' });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Common functionality', () => {
    it('renders payment information section title', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.paymentInformation')).toBeInTheDocument();
    });

    it('renders all DataRow components', () => {
      render(<ReceiptDetail />);
      const dataRows = screen.getAllByTestId('data-row');
      expect(dataRows.length).toBeGreaterThanOrEqual(5);
    });

    it('renders all CopiableRow components', () => {
      render(<ReceiptDetail />);
      const copiableRows = screen.getAllByTestId('copiable-row');
      expect(copiableRows).toHaveLength(4);
    });

    it('renders dividers between copiable rows', () => {
      render(<ReceiptDetail />);
      const dividers = screen.getAllByRole('separator');
      expect(dividers).toHaveLength(3);
    });

    it('uses IUV as filename when filename is not provided', async () => {
      mockMutateAsync.mockResolvedValue({
        blob: new Blob(['test pdf content'], { type: 'application/pdf' }),
        filename: null
      });

      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), '123456789012345678.pdf');
      });
    });

    it('shows error notification when download fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Download failed'));

      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
      });

      expect(mockDownloadBlob).not.toHaveBeenCalled();
    });

    it('renders two Card components', () => {
      const { container } = render(<ReceiptDetail />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(2);
    });

    it('handles undefined params gracefully', () => {
      vi.spyOn(ReactRouterDom, 'useParams').mockReturnValueOnce({
        receiptId: undefined,
        organizationId: undefined
      });

      render(<ReceiptDetail />);

      expect(mockUseReceiptDetail).toHaveBeenCalledWith({
        brokerId: 999,
        organizationId: NaN,
        receiptId: NaN,
        fiscalCode: 'RSSMRA80A01H501U'
      });
    });

    it('handles missing fiscalCode in location state', () => {
      vi.spyOn(ReactRouterDom, 'useLocation').mockReturnValueOnce({
        state: null
      } as any);

      render(<ReceiptDetail />);

      expect(mockUseReceiptDetail).toHaveBeenCalledWith({
        brokerId: 999,
        organizationId: 456,
        receiptId: 123,
        fiscalCode: undefined
      });
    });

    it('converts receiptId and organizationId from URL params to numbers', () => {
      render(<ReceiptDetail />);

      expect(mockUseReceiptDetail).toHaveBeenCalledWith({
        brokerId: 999,
        organizationId: 456,
        receiptId: 123,
        fiscalCode: 'RSSMRA80A01H501U'
      });
    });

    it('passes blob and filename to downloadBlob correctly', async () => {
      const testBlob = new Blob(['test content'], { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({
        blob: testBlob,
        filename: 'custom_receipt.pdf'
      });

      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(testBlob, 'custom_receipt.pdf');
      });
    });
  });
});
