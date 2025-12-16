import { render, screen } from '__tests__/renderers';
import PaymentOptionItem from './PaymentOptionItem';
import {
  DebtorPaymentOptionOverviewDTO,
  InstallmentStatus,
  PaymentOptionStatus,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import React from 'react';

const mockSingleUnpaidInstallmentPaymentOption: DebtorPaymentOptionOverviewDTO = {
  paymentOptionId: 1,
  paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT,
  status: PaymentOptionStatus.UNPAID,
  totalAmountCents: 150,
  installments: [
    {
      installmentId: 1,
      dueDate: '2025-11-19',
      amountCents: 150,
      status: InstallmentStatus.UNPAID,
      remittanceInformation: 'test'
    }
  ]
};

describe('PaymentOptionItem: single installment', () => {
  it('renders elements as expected', () => {
    render(
      <PaymentOptionItem {...mockSingleUnpaidInstallmentPaymentOption} selectionStatus="selected" />
    );

    const type = screen.getByTestId('payment-option-item-type').innerHTML;
    expect(type).toContain('app.debtPositionDetail.paymentOptionSingleInstallment');

    const nexPayDate = screen.getByTestId('payment-option-item-next-pay-date').innerHTML;
    expect(nexPayDate).toContain('app.debtPositionDetail.before 19/11/2025');

    const amount = screen.getByTestId('payment-option-item-total-amount').innerHTML;
    expect(amount).toContain('1,50&nbsp;€');
  });
});

const mockInstallmentsPaymentOption: DebtorPaymentOptionOverviewDTO = {
  paymentOptionId: 1,
  paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT,
  status: PaymentOptionStatus.UNPAID,
  totalAmountCents: 400,
  installments: [
    {
      installmentId: 1,
      dueDate: '2025-07-15',
      amountCents: 100,
      status: InstallmentStatus.EXPIRED,
      remittanceInformation: 'test'
    },
    {
      installmentId: 2,
      dueDate: '2025-08-15',
      amountCents: 100,
      status: InstallmentStatus.PAID,
      remittanceInformation: 'test'
    },
    {
      installmentId: 3,
      dueDate: '2025-09-15',
      amountCents: 100,
      status: InstallmentStatus.UNPAID,
      remittanceInformation: 'test'
    },
    {
      installmentId: 3,
      dueDate: '2025-10-15',
      amountCents: 100,
      status: InstallmentStatus.UNPAID,
      remittanceInformation: 'test'
    }
  ]
};

describe('PaymentOptionItem: multiple installments', () => {
  it('renders elements as expected', () => {
    render(<PaymentOptionItem {...mockInstallmentsPaymentOption} selectionStatus="selected" />);

    const type = screen.getByTestId('payment-option-item-type').innerHTML;
    expect(type).toContain('app.debtPositionDetail.paymentOptionSingleInstallment');

    const nexPayDate = screen.getByTestId('payment-option-item-next-pay-date').innerHTML;
    expect(nexPayDate).toContain('app.debtPositionDetail.before 15/09/2025');

    const amount = screen.getByTestId('payment-option-item-total-amount').innerHTML;
    expect(amount).toContain('4,00&nbsp;€');
  });
});
