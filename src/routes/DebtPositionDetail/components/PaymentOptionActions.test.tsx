import { render, screen } from '__tests__/renderers';
import React from 'react';
import PaymentOptionsActions from './PaymentOptionActions';
import { PaymentOptionType } from '../../../../generated/data-contracts';
import {
  mockSingleUnpaidInstallmentPaymentOption,
  mockInstallmentsPaymentOption
} from './__test__/mocks';

describe('PaymentOptionActions: single installment', () => {
  it('renders elements as expected', () => {
    render(
      <PaymentOptionsActions
        installments={mockSingleUnpaidInstallmentPaymentOption.installments}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.SINGLE_INSTALLMENT}
      />
    );

    const addToCartButton = screen.getByTestId('payment-option-action-add');
    expect(addToCartButton).toBeVisible();
    expect(addToCartButton.innerHTML).toContain('app.debtPositionDetail.addItemToCart');

    const payButton = screen.getByTestId('payment-option-action-pay');
    expect(payButton).toBeVisible();
    expect(payButton.innerHTML).toContain('app.debtPositionDetail.payNow');
  });
});

describe('PaymentOptionsAction: multiple installment', () => {
  it('renders elements as expected', () => {
    render(
      <PaymentOptionsActions
        installments={mockInstallmentsPaymentOption.installments}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.INSTALLMENTS}
      />
    );

    const payButton = screen.getByTestId('payment-option-action-pay');
    expect(payButton).toBeVisible();
    expect(payButton.innerHTML).toContain('app.debtPositionDetail.payLater');
  });
});
