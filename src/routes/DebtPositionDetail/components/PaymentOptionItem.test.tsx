import { render, screen } from '__tests__/renderers';
import PaymentOptionItem from './PaymentOptionItem';
import React from 'react';
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

    // FIRST INSTALLMENT
    const firstInstallmenStatus = screen.getByTestId(
      'payment-option-type-installments-installment-1-status'
    ).innerHTML;
    expect(firstInstallmenStatus).toContain('app.debtPositionDetail.status.EXPIRED');
    const firstInstallmenAmount = screen.getByTestId(
      'payment-option-type-installments-installment-1-amount'
    ).innerHTML;
    expect(firstInstallmenAmount).toContain('1,00&nbsp;€');
    const firstInstallmentLabel = screen.getByTestId(
      'payment-option-type-installments-installment-1'
    ).innerHTML;
    expect(firstInstallmentLabel).toContain('app.debtPositionDetail.installment 1');
    const firstInstallmentDueDate = screen.getByTestId(
      'payment-option-type-installments-installment-1-due-date'
    ).innerHTML;
    expect(firstInstallmentDueDate).toContain('app.debtPositionDetail.before 15/07/2025');

    // SECOND INSTALLMENT
    const secondInstallmenStatus = screen.getByTestId(
      'payment-option-type-installments-installment-2-status'
    ).innerHTML;
    expect(secondInstallmenStatus).toContain('app.debtPositionDetail.status.PAID');
    const secondInstallmenAmount = screen.getByTestId(
      'payment-option-type-installments-installment-2-amount'
    ).innerHTML;
    expect(secondInstallmenAmount).toContain('1,00&nbsp;€');
    const secondInstallmentLabel = screen.getByTestId(
      'payment-option-type-installments-installment-2'
    ).innerHTML;
    expect(secondInstallmentLabel).toContain('app.debtPositionDetail.installment 2');
    const secondInstallmentDueDate = screen.getByTestId(
      'payment-option-type-installments-installment-2-due-date'
    ).innerHTML;
    expect(secondInstallmentDueDate).toContain('app.debtPositionDetail.before 15/08/2025');

    // THIRD INSTALLMENT
    const thirdInstallmenStatus = screen.getByTestId(
      'payment-option-type-installments-installment-3-status'
    ).innerHTML;
    expect(thirdInstallmenStatus).toContain('app.debtPositionDetail.status.UNPAID');
    const thirdInstallmenAmount = screen.getByTestId(
      'payment-option-type-installments-installment-3-amount'
    ).innerHTML;
    expect(thirdInstallmenAmount).toContain('1,50&nbsp;€');
    const thirdInstallmentLabel = screen.getByTestId(
      'payment-option-type-installments-installment-3'
    ).innerHTML;
    expect(thirdInstallmentLabel).toContain('app.debtPositionDetail.installment 3');
    const thirdInstallmentDueDate = screen.getByTestId(
      'payment-option-type-installments-installment-3-due-date'
    ).innerHTML;
    expect(thirdInstallmentDueDate).toContain('app.debtPositionDetail.before 15/09/2025');
  });
});
