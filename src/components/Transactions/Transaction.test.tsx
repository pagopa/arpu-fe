/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Transaction } from './';
import { BrowserRouter } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { ArcRoutes } from 'routes/routes';
import { DebtorReceiptDTO } from '../../../generated/arpu-be/data-contracts';

const mockedUsedNavigate = vi.fn();

vi.mock(import('react-router-dom'), async (importActual) => ({
  ...(await importActual()),
  useNavigate: () => mockedUsedNavigate
}));

vi.mock(import('@mui/material'), async (importActual) => ({
  ...(await importActual()),
  useMediaQuery: vi.fn()
}));

const mockTransactionData: DebtorReceiptDTO = {
  receiptId: 123456,
  organizationId: 789,
  orgFiscalCode: '12345678901',
  orgName: 'Test Organization',
  paymentAmountCents: 10000,
  paymentDateTime: '2024-01-15T10:30:00Z',
  receiptOrigin: 'PAYMENT_NOTICE' as any,
  installmentId: 1,
  remittanceInformation: 'Test payment',
  debtPositionTypeOrgDescription: 'Organization debt type',
  debtPositionTypeDescription: 'Debt type',
  serviceType: 'Standard'
};

describe('Transaction row table component', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockClear();
  });

  it('should call a function to perform a router update on click', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => false);

    render(
      <BrowserRouter>
        <Transaction {...mockTransactionData} />
      </BrowserRouter>
    );

    const button = screen.getByTestId('transaction-details-button');
    fireEvent.click(button);

    expect(mockedUsedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUsedNavigate).toHaveBeenLastCalledWith(
      `${ArcRoutes.RECEIPTS}/${mockTransactionData.receiptId}`
    );
  });

  it('should render without problems', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => true);

    render(
      <BrowserRouter>
        <Transaction {...mockTransactionData} />
      </BrowserRouter>
    );

    expect(screen.getByText(mockTransactionData.orgName)).toBeInTheDocument();
  });

  it('should display organization name', () => {
    (useMediaQuery as ReturnType<typeof vi.fn>).mockImplementation(() => true);

    render(
      <BrowserRouter>
        <Transaction {...mockTransactionData} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Organization')).toBeInTheDocument();
  });
});
