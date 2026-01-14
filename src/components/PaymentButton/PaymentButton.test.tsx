import React from 'react';
import { render } from '@testing-library/react';
import PaymentButton from '.';
import '@testing-library/jest-dom';

describe('Payment Button Component', () => {
  it('renders without problems', () => {
    render(<PaymentButton />);
  });
});
