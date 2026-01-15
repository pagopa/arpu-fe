import { render, screen, fireEvent } from '__tests__/renderers';
import React from 'react';
import PaymentOptionsActions from './PaymentOptionActions';
import { PaymentOptionType } from '../../../../generated/data-contracts';
import {
  mockSingleUnpaidInstallmentPaymentOption,
  mockInstallmentsPaymentOption
} from './__test__/mocks';
import * as cartActions from 'store/CartStore';
import * as installementsDrawerActions from 'store/installmentsDrawer';

describe('PaymentOptionActions: single installment', () => {
  it('renders elements as expected', () => {
    render(
      <PaymentOptionsActions
        debtPositionId={1}
        selectedPaymentOptionId={mockSingleUnpaidInstallmentPaymentOption.paymentOptionId}
        installments={mockSingleUnpaidInstallmentPaymentOption.installments}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.SINGLE_INSTALLMENT}
      />
    );

    const addToCartButton = screen.getByTestId('payment-option-action-add');
    expect(addToCartButton).toBeVisible();
    expect(addToCartButton.innerHTML).toContain('app.debtPositionDetail.addItemToCart');

    const spyAddItem = vi.spyOn(cartActions, 'addItem');

    fireEvent.click(addToCartButton);

    expect(spyAddItem).toHaveBeenCalledWith({
      description: mockSingleUnpaidInstallmentPaymentOption.installments[0].remittanceInformation,
      installmentId: mockSingleUnpaidInstallmentPaymentOption.installments[0].installmentId,
      amount: mockSingleUnpaidInstallmentPaymentOption.installments[0].amountCents as number,
      iuv: mockSingleUnpaidInstallmentPaymentOption.installments[0].iuv as string,
      nav: mockSingleUnpaidInstallmentPaymentOption.installments[0].nav as string,
      paFullName: 'TestOrgName',
      paTaxCode: 'TestOrgId',
      debtPositionId: 1,
      paymentOptionId: mockSingleUnpaidInstallmentPaymentOption.paymentOptionId
    });

    const payButton = screen.getByTestId('payment-option-action-pay');
    expect(payButton).toBeVisible();
    expect(payButton.innerHTML).toContain('app.debtPositionDetail.payNow');
  });

  it('render remove from cart button if single installment is already in cart', () => {
    cartActions.addItem({
      description: mockSingleUnpaidInstallmentPaymentOption.installments[0].remittanceInformation,
      installmentId: mockSingleUnpaidInstallmentPaymentOption.installments[0].installmentId,
      amount: mockSingleUnpaidInstallmentPaymentOption.installments[0].amountCents as number,
      iuv: mockSingleUnpaidInstallmentPaymentOption.installments[0].iuv as string,
      nav: mockSingleUnpaidInstallmentPaymentOption.installments[0].nav as string,
      paFullName: 'TestOrgName',
      paTaxCode: 'TestOrgId',
      debtPositionId: 1,
      paymentOptionId: mockSingleUnpaidInstallmentPaymentOption.paymentOptionId
    });

    render(
      <PaymentOptionsActions
        debtPositionId={1}
        selectedPaymentOptionId={mockSingleUnpaidInstallmentPaymentOption.paymentOptionId}
        installments={mockSingleUnpaidInstallmentPaymentOption.installments}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.SINGLE_INSTALLMENT}
      />
    );

    const removeFromCartButton = screen.getByTestId('payment-option-action-remove');
    expect(removeFromCartButton).toBeVisible();
    expect(removeFromCartButton.innerHTML).toContain('app.debtPositionDetail.removeItemFromCart');

    const spyDeleteItem = vi.spyOn(cartActions, 'deleteItem');

    fireEvent.click(removeFromCartButton);
    expect(spyDeleteItem).toHaveBeenCalledWith(
      mockSingleUnpaidInstallmentPaymentOption.installments[0].iuv as string
    );
  });
});

describe('PaymentOptionsAction: multiple installment', () => {
  it('renders elements as expected', () => {
    render(
      <PaymentOptionsActions
        debtPositionId={1}
        selectedPaymentOptionId={mockInstallmentsPaymentOption.paymentOptionId}
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

  it('open the installments drawer as expected by calling openInstallmentsDrawer', () => {
    render(
      <PaymentOptionsActions
        debtPositionId={1}
        selectedPaymentOptionId={mockInstallmentsPaymentOption.paymentOptionId}
        installments={mockInstallmentsPaymentOption.installments}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.INSTALLMENTS}
      />
    );

    const payButton = screen.getByTestId('payment-option-action-pay');
    expect(payButton).toBeVisible();
    expect(payButton.innerHTML).toContain('app.debtPositionDetail.payLater');

    const spyOpenInstallmentsDrawer = vi.spyOn(
      installementsDrawerActions,
      'openInstallmentsDrawer'
    );
    fireEvent.click(payButton);
    expect(spyOpenInstallmentsDrawer).toHaveBeenCalled();
  });
});
