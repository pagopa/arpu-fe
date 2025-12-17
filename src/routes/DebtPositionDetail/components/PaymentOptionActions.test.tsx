import { render, screen } from '__tests__/renderers';
import React from 'react';
import PaymentOptionsActions from './PaymentOptionActions';
import { PaymentOptionType } from '../../../../generated/data-contracts';

describe('PaymentOptionActions: single installment', () => {
  it('renders elements as expected', () => {
    render(
      <PaymentOptionsActions selectPaymentOptionType={PaymentOptionType.SINGLE_INSTALLMENT} />
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
    render(<PaymentOptionsActions selectPaymentOptionType={PaymentOptionType.INSTALLMENTS} />);

    const payButton = screen.getByTestId('payment-option-action-pay');
    expect(payButton).toBeVisible();
    expect(payButton.innerHTML).toContain('app.debtPositionDetail.payLater');
  });
});
