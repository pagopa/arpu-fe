/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { Actions } from './Actions';
import React from 'react';
import { InstallmentDebtorExtendedDTO, PersonDTO } from '../../../../generated/data-contracts';
import { cartState, resetCart } from 'store/CartStore';

const {
  mockNavigate,
  mockNotifyEmit,
  mockIsAnonymous,
  mockGetBrokerId,
  mockMutateAsync,
  mockReceiptPdf,
  mockPublicReceiptPdf,
  mockDownloadBlob,
  mockCartsMutate,
  mockGetBrokerCode
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockNotifyEmit: vi.fn(),
  mockIsAnonymous: vi.fn(),
  mockGetBrokerId: vi.fn(),
  mockMutateAsync: vi.fn(),
  mockReceiptPdf: vi.fn(),
  mockPublicReceiptPdf: vi.fn(),
  mockDownloadBlob: vi.fn(),
  mockCartsMutate: vi.fn(),
  mockGetBrokerCode: vi.fn()
}));

vi.mock('utils/storage', async (importOriginal) => ({
  ...((await importOriginal()) as any),
  default: {
    user: {
      isAnonymous: () => mockIsAnonymous()
    },
    app: {
      getBrokerId: () => mockGetBrokerId(),
      getBrokerCode: () => mockGetBrokerCode()
    }
  }
}));

vi.mock('utils/loaders', () => ({
  default: {
    useDownloadReceipt: (params: any) => mockReceiptPdf(params),
    public: {
      usePublicDownloadReceipt: (params: any) => mockPublicReceiptPdf(params)
    }
  }
}));

vi.mock('utils/notify', () => ({
  default: {
    emit: (msg: string) => mockNotifyEmit(msg)
  }
}));

vi.mock('utils/files', async (importOriginal) => ({
  ...((await importOriginal()) as any),
  default: {
    ...((await importOriginal()) as any).default,
    downloadBlob: (blob: Blob, filename: string) => mockDownloadBlob(blob, filename),
    downloadReceipt: async (mutateAsync: any, args: any) => {
      try {
        if (args?.receiptId && args?.organizationId && args?.fiscalCode) {
          const { blob, filename } = await mutateAsync({
            organizationId: args.organizationId,
            receiptId: args.receiptId,
            fiscalCode: args.fiscalCode
          });
          mockDownloadBlob(blob, filename || `${args?.receiptId}.pdf`);
        } else {
          throw new Error();
        }
      } catch {
        mockNotifyEmit('app.receiptDetail.downloadError');
      }
    }
  }
}));

vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: () => ({ mutate: mockCartsMutate })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    generatePath: vi.fn((path: string, params: any) =>
      path
        .replace(':nav', params.nav)
        .replace(':receiptId', params.receiptId)
        .replace(':orgId', params.orgId ?? params.organizationId)
        .replace(':organizationId', params.orgId ?? params.organizationId)
    )
  };
});

vi.mock('routes/routes', () => ({
  ROUTES: {
    RECEIPT: '/receipt/:organizationId/:receiptId',
    DEBT_POSITION_DOWNLOAD: '/download/:nav/:orgId',
    COURTESY_PAGE: '/courtesy/:error',
    public: {
      RECEIPT: '/public/receipt/:organizationId/:receiptId',
      DEBT_POSITION_DOWNLOAD: '/public/download/:nav/:orgId',
      COURTESY_PAGE: '/public/courtesy/:error'
    }
  }
}));

const mockPaidInstallment = {
  installmentId: 1,
  iuv: '987654321098765432',
  nav: 'NAV001',
  orgName: 'Test Org',
  orgFiscalCode: '00000000001',
  amountCents: 25000,
  receiptId: 123,
  organizationId: 456,
  status: 'PAID',
  debtor: { fiscalCode: 'RSSMRA80A01H501U', email: 'test@example.com' } as PersonDTO
} as InstallmentDebtorExtendedDTO;

const mockReportedInstallment = {
  ...mockPaidInstallment,
  installmentId: 2,
  status: 'REPORTED'
} as InstallmentDebtorExtendedDTO;

const mockExpiredInstallment = {
  installmentId: 3,
  iuv: '111111111111111111',
  nav: 'NAV002',
  orgName: 'Test Org 3',
  orgFiscalCode: '00000000003',
  amountCents: 15000,
  receiptId: 789,
  organizationId: 321,
  status: 'EXPIRED',
  debtor: { fiscalCode: 'RSSMRA80A01H501U' } as PersonDTO
} as InstallmentDebtorExtendedDTO;

const mockUnpaidInstallment = {
  installmentId: 5,
  iuv: '222222222222222222',
  nav: 'NAV003',
  orgName: 'Test Org 5',
  orgFiscalCode: '00000000005',
  amountCents: 5000,
  organizationId: 654,
  status: 'UNPAID',
  debtor: { fiscalCode: 'RSSMRA80A01H501U', email: 'test@example.com' } as PersonDTO
} as InstallmentDebtorExtendedDTO;

const mockIncompleteInstallment = {
  installmentId: 4,
  iuv: '123456789012345678',
  orgName: 'org2',
  amountCents: 10000,
  status: 'PAID'
} as InstallmentDebtorExtendedDTO;

const clickCartButton = () => {
  const cartButton = screen
    .getAllByRole('button')
    .find((btn) => btn.querySelector('svg[data-testid="ShoppingCartIcon"]'));
  fireEvent.click(cartButton!);
};

describe('Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCart();
    mockIsAnonymous.mockReturnValue(false);
    mockGetBrokerId.mockReturnValue(999);
    mockMutateAsync.mockResolvedValue({
      blob: new Blob(['pdf'], { type: 'application/pdf' }),
      filename: 'receipt_123.pdf'
    });
    mockReceiptPdf.mockReturnValue({ mutateAsync: mockMutateAsync });
    mockPublicReceiptPdf.mockReturnValue({ mutateAsync: mockMutateAsync });
  });

  describe('brokerId guard', () => {
    it('throws when brokerId is null', () => {
      mockGetBrokerId.mockReturnValue(null);
      expect(() => render(<Actions installment={mockPaidInstallment} />)).toThrow(
        'Missing required parameters'
      );
    });

    it('throws when brokerId is undefined', () => {
      mockGetBrokerId.mockReturnValue(undefined);
      expect(() => render(<Actions installment={mockPaidInstallment} />)).toThrow(
        'Missing required parameters'
      );
    });
  });

  describe('Rendering based on status', () => {
    it('renders download icon button and detail button for PAID status', () => {
      render(<Actions installment={mockPaidInstallment} />);
      expect(screen.getByLabelText('actions.download')).toBeInTheDocument();
      expect(screen.getByText('actions.detail')).toBeInTheDocument();
    });

    it('renders download icon button and detail button for REPORTED status', () => {
      render(<Actions installment={mockReportedInstallment} />);
      expect(screen.getByLabelText('actions.download')).toBeInTheDocument();
      expect(screen.getByText('actions.detail')).toBeInTheDocument();
    });

    it('renders only download button for EXPIRED status', () => {
      render(<Actions installment={mockExpiredInstallment} />);
      expect(screen.getByLabelText('actions.download')).toBeInTheDocument();
      expect(screen.getByText('app.debtPositionsSearch.actions.download')).toBeInTheDocument();
      expect(screen.queryByText('actions.detail')).not.toBeInTheDocument();
    });

    it('renders download, cart and pay buttons for UNPAID status', () => {
      render(<Actions installment={mockUnpaidInstallment} />);
      expect(screen.getAllByLabelText('actions.download')).toHaveLength(1);
      expect(screen.getByText('actions.payNow')).toBeInTheDocument();
    });

    it('renders nothing for unknown statuses', () => {
      const { container } = render(
        <Actions installment={{ ...mockPaidInstallment, status: 'DRAFT' } as any} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('onDownloadReceipt (PAID/REPORTED download icon)', () => {
    it('calls receiptPdf.mutateAsync with correct params for authenticated user', async () => {
      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockReceiptPdf).toHaveBeenCalledWith({ brokerId: 999 });
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: 'RSSMRA80A01H501U'
        });
      });
    });

    it('calls publicReceiptPdf.mutateAsync for anonymous user', async () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockPublicReceiptPdf).toHaveBeenCalledWith({ brokerId: 999 });
        expect(mockMutateAsync).toHaveBeenCalledWith({
          organizationId: 456,
          receiptId: 123,
          fiscalCode: 'RSSMRA80A01H501U'
        });
      });
    });

    it('calls downloadBlob with returned blob and filename', async () => {
      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), 'receipt_123.pdf');
      });
    });

    it('falls back to receiptId filename when filename is null', async () => {
      mockMutateAsync.mockResolvedValue({
        blob: new Blob(['pdf'], { type: 'application/pdf' }),
        filename: null
      });

      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(expect.any(Blob), '123.pdf');
      });
    });

    it('emits downloadError when mutateAsync rejects', async () => {
      mockMutateAsync.mockRejectedValue(new Error('network error'));
      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
        expect(mockDownloadBlob).not.toHaveBeenCalled();
      });
    });

    it('emits downloadError when receiptId is missing', async () => {
      render(<Actions installment={{ ...mockPaidInstallment, receiptId: undefined } as any} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
        expect(mockMutateAsync).not.toHaveBeenCalled();
      });
    });

    it('emits downloadError when organizationId is missing', async () => {
      render(
        <Actions installment={{ ...mockPaidInstallment, organizationId: undefined } as any} />
      );
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
      });
    });

    it('emits downloadError when debtor.fiscalCode is missing', async () => {
      render(<Actions installment={{ ...mockPaidInstallment, debtor: {} } as any} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
      });
    });
  });

  describe('onDownloadPaymentNotice (EXPIRED download button)', () => {
    it('navigates to download route with nav for authenticated user', () => {
      render(<Actions installment={mockExpiredInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/download/NAV002/321#debtorFiscalCode=RSSMRA80A01H501U'
      );
    });

    it('navigates to public download route for anonymous user', () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<Actions installment={mockExpiredInstallment} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      expect(mockNavigate).toHaveBeenCalledWith(
        '/public/download/NAV002/321#debtorFiscalCode=RSSMRA80A01H501U'
      );
    });

    it('emits default error when nav is missing', () => {
      render(<Actions installment={{ ...mockExpiredInstallment, nav: undefined } as any} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('emits default error when organizationId is missing', () => {
      render(
        <Actions installment={{ ...mockExpiredInstallment, organizationId: undefined } as any} />
      );
      fireEvent.click(screen.getByLabelText('actions.download'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('emits default error when fiscalCode is missing', () => {
      render(<Actions installment={{ ...mockExpiredInstallment, debtor: {} } as any} />);
      fireEvent.click(screen.getByLabelText('actions.download'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('navigateToDetail (PAID/REPORTED detail button)', () => {
    it('navigates to detail route for authenticated user', () => {
      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNavigate).toHaveBeenCalledWith('/receipt/456/123', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('navigates to public detail route for anonymous user', () => {
      mockIsAnonymous.mockReturnValue(true);
      render(<Actions installment={mockPaidInstallment} />);
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNavigate).toHaveBeenCalledWith('/public/receipt/456/123', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('emits default error when receiptId is missing', () => {
      render(<Actions installment={{ ...mockPaidInstallment, receiptId: undefined } as any} />);
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('emits default error when organizationId is missing', () => {
      render(
        <Actions installment={{ ...mockPaidInstallment, organizationId: undefined } as any} />
      );
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('emits default error when iuv is missing', () => {
      render(<Actions installment={{ ...mockPaidInstallment, iuv: undefined } as any} />);
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('emits default error when fiscalCode is missing', () => {
      render(<Actions installment={{ ...mockPaidInstallment, debtor: {} } as any} />);
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('emits default error when installment data is incomplete', () => {
      render(<Actions installment={mockIncompleteInstallment} />);
      fireEvent.click(screen.getByText('actions.detail'));

      expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('UNPAID actions', () => {
    describe('onDownloadPaymentNotice', () => {
      it('navigates to download route with nav', () => {
        render(<Actions installment={mockUnpaidInstallment} />);
        fireEvent.click(screen.getByLabelText('actions.download'));

        expect(mockNavigate).toHaveBeenCalledWith(
          '/download/NAV003/654#debtorFiscalCode=RSSMRA80A01H501U'
        );
      });

      it('navigates to public download route for anonymous user', () => {
        mockIsAnonymous.mockReturnValue(true);
        render(<Actions installment={mockUnpaidInstallment} />);
        fireEvent.click(screen.getByLabelText('actions.download'));

        expect(mockNavigate).toHaveBeenCalledWith(
          '/public/download/NAV003/654#debtorFiscalCode=RSSMRA80A01H501U'
        );
      });

      it('emits default error when nav is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, nav: undefined } as any} />);
        fireEvent.click(screen.getByLabelText('actions.download'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });

      it('emits default error when organizationId is missing', () => {
        render(
          <Actions installment={{ ...mockUnpaidInstallment, organizationId: undefined } as any} />
        );
        fireEvent.click(screen.getByLabelText('actions.download'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });

      it('emits default error when fiscalCode is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, debtor: {} } as any} />);
        fireEvent.click(screen.getByLabelText('actions.download'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });
    });

    describe('addToCart', () => {
      it('calls addItem with correct cart item', () => {
        render(<Actions installment={mockUnpaidInstallment} />);
        clickCartButton();

        expect(cartState.value.items).toHaveLength(1);
        expect(cartState.value.items[0]).toMatchObject({
          installmentId: 5,
          amount: 5000,
          description: undefined,
          iuv: '222222222222222222',
          nav: 'NAV003',
          paFullName: 'Test Org 5',
          paTaxCode: '00000000005'
        });
        expect(cartState.value.amount).toBe(5000);
      });

      it('emits drawer error when nav is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, nav: undefined } as any} />);
        clickCartButton();

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.drawer');
        expect(cartState.value.items).toHaveLength(0);
      });

      it('emits drawer error when iuv is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, iuv: undefined } as any} />);
        clickCartButton();

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.drawer');
        expect(cartState.value.items).toHaveLength(0);
      });

      it('emits drawer error when amountCents is missing', () => {
        render(
          <Actions installment={{ ...mockUnpaidInstallment, amountCents: undefined } as any} />
        );
        clickCartButton();

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.drawer');
        expect(cartState.value.items).toHaveLength(0);
      });

      it('emits drawer error when orgName is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, orgName: undefined } as any} />);
        clickCartButton();

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.drawer');
        expect(cartState.value.items).toHaveLength(0);
      });

      it('emits drawer error when orgFiscalCode is missing', () => {
        render(
          <Actions installment={{ ...mockUnpaidInstallment, orgFiscalCode: undefined } as any} />
        );
        clickCartButton();

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.drawer');
      });
    });

    describe('goToPayment', () => {
      it('calls carts.mutate with correct cart item and email', () => {
        render(<Actions installment={mockUnpaidInstallment} />);
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockCartsMutate).toHaveBeenCalledWith({
          notices: [
            {
              installmentId: 5,
              amount: 5000,
              description: undefined,
              iuv: '222222222222222222',
              nav: 'NAV003',
              paFullName: 'Test Org 5',
              paTaxCode: '00000000005',
              allCCP: false
            }
          ],
          email: 'test@example.com'
        });
      });

      it('falls back to undefined when debtor email is missing', () => {
        render(
          <Actions
            installment={
              { ...mockUnpaidInstallment, debtor: { fiscalCode: 'RSSMRA80A01H501U' } } as any
            }
          />
        );
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockCartsMutate).toHaveBeenCalledWith(expect.objectContaining({ email: undefined }));
      });

      it('emits payment error when nav is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, nav: undefined } as any} />);
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.payment');
        expect(mockCartsMutate).not.toHaveBeenCalled();
      });

      it('emits payment error when iuv is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, iuv: undefined } as any} />);
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.payment');
        expect(mockCartsMutate).not.toHaveBeenCalled();
      });

      it('emits payment error when amountCents is missing', () => {
        render(
          <Actions installment={{ ...mockUnpaidInstallment, amountCents: undefined } as any} />
        );
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.payment');
        expect(mockCartsMutate).not.toHaveBeenCalled();
      });

      it('emits payment error when orgName is missing', () => {
        render(<Actions installment={{ ...mockUnpaidInstallment, orgName: undefined } as any} />);
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.payment');
        expect(mockCartsMutate).not.toHaveBeenCalled();
      });

      it('emits payment error when orgFiscalCode is missing', () => {
        render(
          <Actions installment={{ ...mockUnpaidInstallment, orgFiscalCode: undefined } as any} />
        );
        fireEvent.click(screen.getByText('actions.payNow'));

        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.payment');
        expect(mockCartsMutate).not.toHaveBeenCalled();
      });
    });
  });
});
