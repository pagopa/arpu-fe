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
import { setBrokerInfo } from 'store/appStore';
import utils from 'utils';

const mockPostCartsMutate = vi.fn();
const mockNavigate = vi.fn();

vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: (opts: { onSuccess: (url: string) => void; onError: (err: string) => void }) => ({
    mutate: (...args: unknown[]) => mockPostCartsMutate(opts, ...args),
    isPending: false
  })
}));

vi.mock('hooks/useUserEmail', () => ({
  useUserEmail: () => 'test@example.com'
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('PaymentOptionActions: single installment', () => {
  setBrokerInfo(
    {
      brokerId: 1,
      externalId: 'test-external-id',
      brokerName: 'TestBrokerName',
      brokerFiscalCode: 'TestBrokerTaxCode',
      config: {
        translation: {},
        useCart: true
      }
    },
    'test'
  );

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
      paymentOptionId: mockSingleUnpaidInstallmentPaymentOption.paymentOptionId,
      allCCP: false
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
      paymentOptionId: mockSingleUnpaidInstallmentPaymentOption.paymentOptionId,
      allCCP: false
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

describe('PaymentOptionActions - payItem (SINGLE_INSTALLMENT)', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        replace: vi.fn(),
        assign: vi.fn()
      }
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation
    });
    vi.clearAllMocks();
  });

  it('calls carts.mutate with the correct notice when pay button is clicked', () => {
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

    fireEvent.click(screen.getByTestId('payment-option-action-pay'));

    expect(mockPostCartsMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: 'test@example.com',
        notices: [
          expect.objectContaining({
            iuv: mockSingleUnpaidInstallmentPaymentOption.installments[0].iuv,
            nav: mockSingleUnpaidInstallmentPaymentOption.installments[0].nav,
            paFullName: 'TestOrgName',
            paTaxCode: 'TestOrgId'
          })
        ]
      })
    );
  });

  it('emits notify.emit when the installment is missing required data', () => {
    const notifySpy = vi.spyOn(utils.notify, 'emit');

    const corruptedInstallments = [
      {
        ...mockSingleUnpaidInstallmentPaymentOption.installments[0],
        amountCents: undefined
      }
    ];

    render(
      <PaymentOptionsActions
        debtPositionId={1}
        selectedPaymentOptionId={mockSingleUnpaidInstallmentPaymentOption.paymentOptionId}
        installments={corruptedInstallments as never}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.SINGLE_INSTALLMENT}
      />
    );

    fireEvent.click(screen.getByTestId('payment-option-action-pay'));

    expect(notifySpy).toHaveBeenCalledWith(expect.stringContaining('missing required data'));
    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('replaces window.location on successful cart mutation', () => {
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

    fireEvent.click(screen.getByTestId('payment-option-action-pay'));

    const [opts] = mockPostCartsMutate.mock.calls[0];
    opts.onSuccess('https://checkout.example');

    expect(window.location.replace).toHaveBeenCalledWith('https://checkout.example');
  });

  it('navigates to the courtesy page when the cart mutation fails', () => {
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

    fireEvent.click(screen.getByTestId('payment-option-action-pay'));

    const [opts] = mockPostCartsMutate.mock.calls[0];
    opts.onError('generic');

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('esito'));
  });
});

describe('PaymentOptionActions - addItemToCart errors', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('emits notify.emit when adding an item with missing required data', () => {
    const notifySpy = vi.spyOn(utils.notify, 'emit');
    const addItemSpy = vi.spyOn(cartActions, 'addItem');

    const corruptedInstallments = [
      {
        ...mockSingleUnpaidInstallmentPaymentOption.installments[0],
        nav: undefined
      }
    ];

    render(
      <PaymentOptionsActions
        debtPositionId={1}
        selectedPaymentOptionId={mockSingleUnpaidInstallmentPaymentOption.paymentOptionId}
        installments={corruptedInstallments as never}
        orgName="TestOrgName"
        orgId="TestOrgId"
        selectPaymentOptionType={PaymentOptionType.SINGLE_INSTALLMENT}
      />
    );

    fireEvent.click(screen.getByTestId('payment-option-action-add'));

    expect(notifySpy).toHaveBeenCalledWith(expect.stringContaining('missing required data'));
    expect(addItemSpy).not.toHaveBeenCalled();
  });
});

describe('PaymentOptionActions - INSTALLMENTS mapping', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps installments with rateIndex, paFullName, paTaxCode and ids', () => {
    const openSpy = vi.spyOn(installementsDrawerActions, 'openInstallmentsDrawer');

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

    fireEvent.click(screen.getByTestId('payment-option-action-pay'));

    expect(openSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          rateIndex: 1,
          paFullName: 'TestOrgName',
          paTaxCode: 'TestOrgId',
          debtPositionId: 1,
          paymentOptionId: mockInstallmentsPaymentOption.paymentOptionId
        })
      ])
    );
  });
});
