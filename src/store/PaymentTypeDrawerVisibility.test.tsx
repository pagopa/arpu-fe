import {
  paymentTypeDrawerVisibilityStore,
  togglePaymentTypeDrawerVisibility
} from './PaymentTypeDrawerVisibilityStore';

describe('PaymenTypeDrawerVisibility', () => {
  it('should start with the rigth default value', () => {
    expect(paymentTypeDrawerVisibilityStore.value).toEqual(false);
  });

  it('should toggle its state correctly', () => {
    togglePaymentTypeDrawerVisibility();
    expect(paymentTypeDrawerVisibilityStore.value).toEqual(true);
    togglePaymentTypeDrawerVisibility();
    expect(paymentTypeDrawerVisibilityStore.value).toEqual(false);
  });
});
