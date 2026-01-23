import { render, screen, within } from '__tests__/renderers';
import PaymentOptionItem from './PaymentOptionItem';
import React from 'react';
import '@testing-library/jest-dom';
import {
  mockSingleUnpaidInstallmentPaymentOption,
  mockInstallmentsPaymentOption
} from './__test__/mocks';

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

describe('PaymentOptionItem: multiple installments', () => {
  it('renders elements as expected', () => {
    render(<PaymentOptionItem {...mockInstallmentsPaymentOption} selectionStatus="selected" />);

    const type = screen.getByTestId('payment-option-item-type').innerHTML;
    expect(type).toContain('app.debtPositionDetail.paymentOptionInstallments');

    const nexPayDate = screen.getByTestId('payment-option-item-next-pay-date').innerHTML;
    expect(nexPayDate).toContain('app.debtPositionDetail.before 15/09/2025');

    const amount = screen.getByTestId('payment-option-item-total-amount').innerHTML;
    expect(amount).toContain('5,00&nbsp;€');
  });

  it('renders extra info as expected', () => {
    render(<PaymentOptionItem {...mockInstallmentsPaymentOption} selectionStatus="selected" />);

    const ExtraInfo = screen.getByTestId('payment-option-item-type-installments-extra-info');
    expect(ExtraInfo).toBeVisible();

    const installments = screen.getAllByTestId('installment-item');

    // FIRST INSTALLMENT
    const firstInstallment = within(installments[0]);
    expect(firstInstallment.getByText('installment.status.EXPIRED')).toBeVisible();
    expect(firstInstallment.getByText('1,00 €')).toBeVisible();
    expect(firstInstallment.getByText('app.debtPositionDetail.installment 1')).toBeVisible();
    expect(firstInstallment.getByText('app.debtPositionDetail.before 15/07/2025')).toBeVisible();

    // SECOND INSTALLMENT
    const secondInstallment = within(installments[1]);
    expect(secondInstallment.getByText('installment.status.PAID')).toBeVisible();
    expect(secondInstallment.getByText('1,00 €')).toBeVisible();
    expect(secondInstallment.getByText('app.debtPositionDetail.installment 2')).toBeVisible();
    expect(secondInstallment.getByText('app.debtPositionDetail.before 15/08/2025')).toBeVisible();

    // THIRD INSTALLMENT
    const thirdInstallment = within(installments[2]);
    expect(thirdInstallment.getByText('installment.status.UNPAID')).toBeVisible();
    expect(thirdInstallment.getByText('1,50 €')).toBeVisible();
    expect(thirdInstallment.getByText('app.debtPositionDetail.installment 3')).toBeVisible();
    expect(thirdInstallment.getByText('app.debtPositionDetail.before 15/09/2025')).toBeVisible();
  });
});
