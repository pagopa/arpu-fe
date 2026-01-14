import { render } from '__tests__/renderers';
import React from 'react';
import PaymentOptions from './PaymentOptions';
import { paymentOptions } from './__test__/mocks';

describe('PaymentOptions', () => {
  it('renders as expected without crashing', () => {
    render(<PaymentOptions paymentOptions={paymentOptions} />);
  });
});
