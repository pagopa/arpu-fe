/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { Actions } from './Actions';
import React from 'react';
import { InstallmentDebtorExtendedDTO, PersonDTO } from '../../../../../generated/data-contracts';

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
const mockNotifyEmit = vi.fn();
const mockGetBrokerId = vi.fn();
const mockIsAnonymous = vi.fn();
const mockDownloadBlob = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    generatePath: vi.fn((route, params) => {
      if (route.includes('public')) {
        return `/public/receipt/${params.organizationId}/${params.receiptId}`;
      }
      return `/receipt/${params.organizationId}/${params.receiptId}`;
    })
  };
});

vi.mock('routes/routes', () => ({
  ArcRoutes: {
    RECEIPT: '/receipt/:organizationId/:receiptId',
    public: {
      RECEIPT: '/public/receipt/:organizationId/:receiptId'
    }
  }
}));

// Mock ActionMenu component
vi.mock('components/ActionMenu/ActionMenu', () => ({
  default: ({ rowId, menuItems }: any) => (
    <div>
      <button data-testid={`action-menu-${rowId}`}>Menu</button>
      <div data-testid={`menu-items-${rowId}`}>
        {menuItems.map((item: any, index: number) => (
          <button key={index} onClick={item.action} data-testid={`menu-item-${index}`}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}));

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

describe('Receipts Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockMutateAsync.mockClear();
    mockNotifyEmit.mockClear();
    mockGetBrokerId.mockReturnValue('broker123');
    mockIsAnonymous.mockReturnValue(false);
    mockDownloadBlob.mockClear();
  });

  it('should render', () => {
    render(<Actions installment={mockInstallment} />);
    expect(screen.getByTestId('action-menu-1')).toBeInTheDocument();
  });

  it('should show error notification when installment data is incomplete for navigation', async () => {
    render(<Actions installment={mockIncompleteInstallment} />);

    const viewDetailButton = screen.getByText('app.receiptsSearch.actions.toDetail');
    fireEvent.click(viewDetailButton);

    await waitFor(() => {
      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Download receipt', () => {
    it('should download receipt successfully for authenticated user', async () => {
      mockIsAnonymous.mockReturnValue(false);
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({
        blob: mockBlob,
        filename: 'receipt.pdf'
      });

      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByText('app.receiptsSearch.actions.download');
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

      const downloadButton = screen.getByText('app.receiptsSearch.actions.download');
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

      const downloadButton = screen.getByText('app.receiptsSearch.actions.download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
        expect(mockDownloadBlob).toHaveBeenCalled();
      });
    });

    it('should show error notification when download fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Download failed'));

      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByText('app.receiptsSearch.actions.download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
        expect(mockDownloadBlob).not.toHaveBeenCalled();
      });
    });

    it('should show error notification when installment data is incomplete for download', async () => {
      render(<Actions installment={mockIncompleteInstallment} />);

      const downloadButton = screen.getByText('app.receiptsSearch.actions.download');
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

      const downloadButton = screen.getByText('app.receiptsSearch.actions.download');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });
    });
  });

  describe('Action menu items', () => {
    it('should render both menu items when action menu is opened', async () => {
      render(<Actions installment={mockInstallment} />);

      expect(screen.getByText('app.receiptsSearch.actions.toDetail')).toBeInTheDocument();
      expect(screen.getByText('app.receiptsSearch.actions.download')).toBeInTheDocument();
    });
  });
});
