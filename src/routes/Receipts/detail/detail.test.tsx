/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
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
  nav: '30123456789012345678',
  iur: 'IUR123456789',
  iud: 'IUD987654321',
  pspCompanyName: 'Test Payment Provider',
  debtor: {
    fullName: 'Mario Rossi',
    fiscalCode: 'RSSMRA80A01H501U'
  }
};

const mockNavigate = vi.fn();
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
        spacing: vi.fn((value: number) => `${value * 8}px`)
      }
    }
  }
}));

vi.mock('utils/loaders', () => ({
  default: {
    useReceiptDetail: (params?: any) => mockUseReceiptDetail(params),
    public: {
      usePublicReceiptDetail: (params?: any) => mockUsePublicReceiptDetail(params)
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
    useNavigate: () => mockNavigate,
    generatePath: vi.fn((path: string, params: any) => {
      return path.replace(':nav', params.nav).replace(':organizationId', params.organizationId);
    }),
    useMatches: vi.fn(() => [])
  };
});

vi.mock('routes/routes', () => ({
  ROUTES: {
    DEBT_POSITION_DOWNLOAD: '/receipt/:organizationId/:nav/download',
    public: {
      DEBT_POSITION_DOWNLOAD: '/public/receipt/:organizationId/:nav/download'
    }
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

    it('navigates to download route when download button is clicked', () => {
      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      expect(mockNavigate).toHaveBeenCalledWith('/receipt/456/30123456789012345678/download', {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('does not render bottom action buttons for authenticated user', () => {
      render(<ReceiptDetail />);
      const downloadButtons = screen.getAllByRole('button', { name: 'app.receiptDetail.download' });
      // Should only have one download button at the top
      expect(downloadButtons).toHaveLength(1);
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

    it('does not render download button at top for anonymous user', () => {
      render(<ReceiptDetail />);
      const downloadButtons = screen.getAllByRole('button', { name: 'app.receiptDetail.download' });
      expect(downloadButtons).toHaveLength(1);
    });

    it('navigates to public download route for anonymous user', () => {
      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        '/public/receipt/456/30123456789012345678/download',
        {
          state: { fiscalCode: 'RSSMRA80A01H501U' }
        }
      );
    });

    it('navigates back when back button is clicked', () => {
      render(<ReceiptDetail />);

      const backButton = screen.getByRole('button', { name: 'app.routes.back' });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('calls usePublicReceiptDetail for anonymous user', () => {
      render(<ReceiptDetail />);

      expect(mockUsePublicReceiptDetail).toHaveBeenCalledWith({
        brokerId: 999,
        organizationId: 456,
        receiptId: 123,
        fiscalCode: 'RSSMRA80A01H501U'
      });
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
      expect(dataRows.length).toBe(7);
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

    it('renders two Card components', () => {
      const { container } = render(<ReceiptDetail />);
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards).toHaveLength(2);
    });

    it('renders debt position type description as card title', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('Municipal Tax Payment')).toBeInTheDocument();
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

    it('passes fiscalCode in state when navigating to download', () => {
      render(<ReceiptDetail />);

      const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
      fireEvent.click(downloadButton);

      expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
        state: { fiscalCode: 'RSSMRA80A01H501U' }
      });
    });

    it('renders payment amount correctly', () => {
      render(<ReceiptDetail />);
      const dataRows = screen.getAllByTestId('data-row');
      // First row should be amount
      expect(dataRows[0]).toBeInTheDocument();
    });

    it('renders remittance information', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.remittanceInformation')).toBeInTheDocument();
    });

    it('renders Notice Code', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.noticeCode')).toBeInTheDocument();
    });

    it('renders beneficiary information', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.beneficiary')).toBeInTheDocument();
      expect(screen.getByText('app.receiptDetail.beneficiaryFiscalCode')).toBeInTheDocument();
    });

    it('renders debtor information', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.debtor')).toBeInTheDocument();
      expect(screen.getByText('app.receiptDetail.debtorFiscalCode')).toBeInTheDocument();
    });

    it('renders PSP information', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.psp')).toBeInTheDocument();
    });

    it('renders payment date', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.paymentDate')).toBeInTheDocument();
    });

    it('renders IUR with copy functionality', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.iur')).toBeInTheDocument();
    });

    it('renders IUD with copy functionality', () => {
      render(<ReceiptDetail />);
      expect(screen.getByText('app.receiptDetail.iud')).toBeInTheDocument();
    });
  });
});
