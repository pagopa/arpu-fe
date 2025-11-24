/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { useMediaQuery } from '@mui/material';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { ReceiptsProps, Receipts } from './Receipts';
import { DebtorReceiptDTO } from '../../../../generated/arpu-be/data-contracts';

i18nTestSetup({});

vi.mock(import('@mui/material'), async (importActual) => ({
  ...(await importActual()),
  useMediaQuery: vi.fn()
}));

const mockReceiptsData: DebtorReceiptDTO[] = [
  {
    receiptId: 1,
    organizationId: 100,
    orgFiscalCode: '12345678901',
    orgName: 'Organization 1',
    paymentAmountCents: 10000,
    paymentDateTime: '2024-01-15T10:30:00Z',
    receiptOrigin: 'PAYMENT_NOTICE' as any,
    installmentId: 1,
    remittanceInformation: 'Payment 1',
    debtPositionTypeOrgDescription: 'Org debt type 1',
    debtPositionTypeDescription: 'Debt type 1',
    serviceType: 'Standard'
  },
  {
    receiptId: 2,
    organizationId: 101,
    orgFiscalCode: '12345678902',
    orgName: 'Organization 2',
    paymentAmountCents: 20000,
    paymentDateTime: '2024-01-16T11:30:00Z',
    receiptOrigin: 'PAYMENT_NOTICE' as any,
    installmentId: 2,
    remittanceInformation: 'Payment 2',
    debtPositionTypeOrgDescription: 'Org debt type 2',
    debtPositionTypeDescription: 'Debt type 2',
    serviceType: 'Standard'
  },
  {
    receiptId: 3,
    organizationId: 102,
    orgFiscalCode: '12345678903',
    orgName: 'Organization 3',
    paymentAmountCents: 30000,
    paymentDateTime: '2024-01-17T12:30:00Z',
    receiptOrigin: 'PAYMENT_NOTICE' as any,
    installmentId: 3,
    remittanceInformation: 'Payment 3',
    debtPositionTypeOrgDescription: 'Org debt type 3',
    debtPositionTypeDescription: 'Debt type 3',
    serviceType: 'Standard'
  },
  {
    receiptId: 4,
    organizationId: 103,
    orgFiscalCode: '12345678904',
    orgName: 'Organization 4',
    paymentAmountCents: 40000,
    paymentDateTime: '2024-01-18T13:30:00Z',
    receiptOrigin: 'PAYMENT_NOTICE' as any,
    installmentId: 4,
    remittanceInformation: 'Payment 4',
    debtPositionTypeOrgDescription: 'Org debt type 4',
    debtPositionTypeDescription: 'Debt type 4',
    serviceType: 'Standard'
  }
];

const ReceiptsWithRouter = (props: ReceiptsProps) => (
  <MemoryRouter>
    <Receipts {...props} />
  </MemoryRouter>
);

describe('Receipts table component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render as expected', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => true);

    render(<ReceiptsWithRouter rows={mockReceiptsData} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render the expected rows', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => false);

    render(<ReceiptsWithRouter rows={mockReceiptsData} />);
    const rows = screen.getAllByRole('button');
    expect(rows.length).toBe(4);
  });

  it('should render table headers on desktop', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => true);

    render(<ReceiptsWithRouter rows={mockReceiptsData} />);

    expect(screen.getByText('app.receipts.payee')).toBeInTheDocument();
    expect(screen.getByText('app.receipts.date')).toBeInTheDocument();
  });

  it('should render organization names', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => false);

    render(<ReceiptsWithRouter rows={mockReceiptsData} />);

    expect(screen.getByText('Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Organization 2')).toBeInTheDocument();
    expect(screen.getByText('Organization 3')).toBeInTheDocument();
    expect(screen.getByText('Organization 4')).toBeInTheDocument();
  });

  it('should render empty table when no rows provided', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => false);

    render(<ReceiptsWithRouter rows={[]} />);

    const rows = screen.queryAllByRole('button');
    expect(rows.length).toBe(0);
  });
});
