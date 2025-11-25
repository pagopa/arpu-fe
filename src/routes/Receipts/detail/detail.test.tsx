/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '../../../__tests__/renderers';
import { useReceiptDetail } from './hooks/useReceiptDetail';
import { ReceiptDetail } from '.';
import { Mock } from 'vitest';

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

vi.mock('./hooks/useReceiptDetail');

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
    }))
  };
});

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
    (useReceiptDetail as Mock).mockReturnValue({
      data: mockReceiptData,
      isLoading: false,
      isError: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<ReceiptDetail />);

    const downloadButton = screen.getByRole('button', { name: 'app.receiptDetail.download' });
    expect(downloadButton).toBeInTheDocument();
  });

  it('renders payment information section title', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.paymentInformation')).toBeInTheDocument();
  });

  it('renders all DataRow components', () => {
    render(<ReceiptDetail />);

    const dataRows = screen.getAllByTestId('data-row');
    // Should have rows for: amount, remittanceInformation, iuv, debtor, debtorFiscalCode
    expect(dataRows.length).toBeGreaterThanOrEqual(5);
  });

  it('renders all CopiableRow components', () => {
    render(<ReceiptDetail />);

    const copiableRows = screen.getAllByTestId('copiable-row');
    // Should have rows for: psp, paymentDate, iur, iud
    expect(copiableRows).toHaveLength(4);
  });

  it('renders dividers between copiable rows', () => {
    render(<ReceiptDetail />);

    const dividers = screen.getAllByRole('separator');
    // Should have 3 dividers (between 4 copiable rows)
    expect(dividers).toHaveLength(3);
  });

  it('calls useReceiptDetail with correct parameters', () => {
    render(<ReceiptDetail />);

    expect(useReceiptDetail).toHaveBeenCalledWith([999, 456, 123]);
  });

  it('converts brokerId from string to number', () => {
    render(<ReceiptDetail />);

    expect(useReceiptDetail).toHaveBeenCalledWith([999, 456, 123]);
  });

  it('renders two Card components', () => {
    const { container } = render(<ReceiptDetail />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards).toHaveLength(2);
  });

  it('renders all translation keys correctly', () => {
    render(<ReceiptDetail />);

    expect(screen.getByText('app.receiptDetail.title')).toBeInTheDocument();
    expect(screen.getByText('app.receiptDetail.download')).toBeInTheDocument();
    expect(screen.getByText('app.receiptDetail.paymentInformation')).toBeInTheDocument();

    // Labels should be present (via DataRow and CopiableRow)
    const labels = screen.getAllByTestId('data-row-label');
    expect(labels.length).toBeGreaterThan(0);
  });
});
