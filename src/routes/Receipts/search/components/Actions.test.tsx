/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { Actions } from './Actions';
import React from 'react';
import { InstallmentDebtorExtendedDTO, PersonDTO } from '../../../../../generated/data-contracts';

const mockNavigate = vi.fn();
const mockNotifyEmit = vi.fn();
const mockIsAnonymous = vi.fn();

vi.mock('utils', () => ({
  default: {
    storage: {
      user: {
        isAnonymous: () => mockIsAnonymous()
      }
    },
    notify: {
      emit: (msg: string) => mockNotifyEmit(msg)
    }
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    generatePath: vi.fn((path: string, params: any) => {
      return path
        .replace(':receiptId', params.receiptId)
        .replace(':organizationId', params.organizationId);
    })
  };
});

vi.mock('routes/routes', () => ({
  ArcRoutes: {
    RECEIPT: '/receipt/:organizationId/:receiptId',
    RECEIPT_DOWNLOAD: '/receipt/:organizationId/:receiptId/download',
    public: {
      RECEIPT: '/public/receipt/:organizationId/:receiptId',
      RECEIPT_DOWNLOAD: '/public/receipt/:organizationId/:receiptId/download'
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
    mockIsAnonymous.mockReturnValue(false);
  });

  it('should render download icon button and detail button', () => {
    render(<Actions installment={mockInstallment} />);

    expect(screen.getByLabelText('download')).toBeInTheDocument();
    expect(screen.getByText('actions.detail')).toBeInTheDocument();
  });

  describe('Download functionality', () => {
    it('should navigate to download route for authenticated user', () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      expect(mockNavigate).toHaveBeenCalledWith('/receipt/456/123/download', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('should navigate to public download route for anonymous user', () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<Actions installment={mockInstallment} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      expect(mockNavigate).toHaveBeenCalledWith('/public/receipt/456/123/download', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('should show error notification when receiptId is missing', () => {
      const installmentWithoutReceiptId = {
        ...mockInstallment,
        receiptId: undefined
      };

      render(<Actions installment={installmentWithoutReceiptId} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error notification when organizationId is missing', () => {
      const installmentWithoutOrgId = {
        ...mockInstallment,
        organizationId: undefined
      };

      render(<Actions installment={installmentWithoutOrgId as any} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error notification when fiscalCode is missing', () => {
      const installmentWithoutFiscalCode = {
        ...mockInstallment,
        debtor: {}
      };

      render(<Actions installment={installmentWithoutFiscalCode as any} />);

      const downloadButton = screen.getByLabelText('download');
      fireEvent.click(downloadButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Detail navigation', () => {
    it('should navigate to detail route for authenticated user', () => {
      mockIsAnonymous.mockReturnValue(false);
      render(<Actions installment={mockInstallment} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNavigate).toHaveBeenCalledWith('/receipt/456/123', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('should navigate to public detail route for anonymous user', () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<Actions installment={mockInstallment} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNavigate).toHaveBeenCalledWith('/public/receipt/456/123', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('should show error notification when receiptId is missing', () => {
      const installmentWithoutReceiptId = {
        ...mockInstallment,
        receiptId: undefined
      };

      render(<Actions installment={installmentWithoutReceiptId} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error notification when organizationId is missing', () => {
      const installmentWithoutOrgId = {
        ...mockInstallment,
        organizationId: undefined
      };

      render(<Actions installment={installmentWithoutOrgId as any} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error notification when iuv is missing', () => {
      const installmentWithoutIuv = {
        ...mockInstallment,
        iuv: undefined
      };

      render(<Actions installment={installmentWithoutIuv} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error notification when fiscalCode is missing', () => {
      const installmentWithoutFiscalCode = {
        ...mockInstallment,
        debtor: {}
      };

      render(<Actions installment={installmentWithoutFiscalCode as any} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error notification when installment data is incomplete', () => {
      render(<Actions installment={mockIncompleteInstallment} />);

      const detailButton = screen.getByText('actions.detail');
      fireEvent.click(detailButton);

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
