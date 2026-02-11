import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductLogo } from '.';
import '@testing-library/jest-dom';
import { setBrokerInfo } from 'store/appStore';

describe('ProductLogo', () => {
  it('renders without problems', () => {
    setBrokerInfo({ brokerName: 'test', brokerFiscalCode: 'test', brokerLogo: 'test' });
    render(<ProductLogo />);
    expect(screen.getByTestId('header-product-logo')).toBeInTheDocument();
  });
});
