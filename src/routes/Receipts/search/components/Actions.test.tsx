/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { Actions } from './Actions';
import React from 'react';
import { InstallmentDebtorExtendedDTO, PersonDTO } from '../../../../../generated/data-contracts';

const mockMutateAsync = vi.fn();
const mockNotifyEmit = vi.fn();
const mockGetBrokerId = vi.fn();
const mockIsAnonymous = vi.fn();
const mockDownloadBlob = vi.fn();

vi.mock('utils', () => ({
  default: {
    storage: {
      app: {
        getBrokerId: () => mockGetBrokerId()
      },
      user: {
        isAnonymous: () => mockIsAnonymous()
      }
    },
    loaders: {
      public: {
        usePublicDownloadReceipt: () => ({ mutateAsync: mockMutateAsync })
      },
      useDownloadReceipt: () => ({ mutateAsync: mockMutateAsync })
    },
    notify: {
      emit: (msg: string) => mockNotifyEmit(msg)
    },
    files: {
      downloadBlob: (blob: Blob, filename: string) => mockDownloadBlob(blob, filename)
    }
  }
}));

const mockInstallment = {
  installmentId: 1,
  iuv: '987654321098765432',
  orgName: 'org',
  amountCents: 25000,
  receiptId: 123,
  organizationId: 456,
  debtor: {
    fiscalCode: 'RSSMRA80A01H501U'
  } as PersonDTO
} as InstallmentDebtorExtendedDTO;

const mockIncompleteInstallment = {
  installmentId: 2,
  iuv: '123456789012345678',
  orgName: 'org2',
  amountCents: 10000
} as InstallmentDebtorExtendedDTO;

describe('Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockClear();
    mockNotifyEmit.mockClear();
    mockGetBrokerId.mockReturnValue('broker123');
    mockIsAnonymous.mockReturnValue(false);
    mockDownloadBlob.mockClear();
  });

  it('should render download icon button and detail button', () => {
    render(<Actions installment={mockInstallment} />);

    expect(screen.getByLabelText('download')).toBeInTheDocument();
    expect(screen.getByText('actions.detail')).toBeInTheDocument();
  });

  describe('When installmentType is RECEIPTS', () => {
    it('should show error notification when installment data is incomplete for navigation', async () => {
      render(<Actions installment={mockIncompleteInstallment} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });
    });

    it('should download receipt successfully for authenticated user', async () => {
      mockIsAnonymous.mockReturnValue(false);
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({
        blob: mockBlob,
        filename: 'receipt.pdf'
      });

      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          receiptId: 123,
          organizationId: 456,
          fiscalCode: 'RSSMRA80A01H501U'
        });
        expect(mockDownloadBlob).toHaveBeenCalledWith(mockBlob, 'receipt.pdf');
      });
    });

    it('should download receipt with IUV fallback filename when filename is not provided', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({
        blob: mockBlob,
        filename: null
      });

      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(mockBlob, '987654321098765432.pdf');
      });
    });

    it('should use public download for anonymous user', async () => {
      mockIsAnonymous.mockReturnValue(true);
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({
        blob: mockBlob,
        filename: 'receipt.pdf'
      });

      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
        expect(mockDownloadBlob).toHaveBeenCalled();
      });
    });

    it('should show error notification when download fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Download failed'));

      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
        expect(mockDownloadBlob).not.toHaveBeenCalled();
      });
    });

    it('should show error notification when installment data is incomplete for download', async () => {
      render(<Actions installment={mockIncompleteInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
        expect(mockMutateAsync).not.toHaveBeenCalled();
      });
    });

    it('should handle missing receiptId', async () => {
      const installmentWithoutReceiptId = {
        ...mockInstallment,
        receiptId: undefined
      };

      render(<Actions installment={installmentWithoutReceiptId} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });
    });
  });
});
