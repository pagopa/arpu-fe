import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubHeader } from './SubHeader';
import { cartState, toggleCartDrawer } from '../../store/CartStore';
import { setBrokerInfo } from 'store/appStore';

vi.mock(import('store/CartStore'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    toggleCartDrawer: vi.fn(actual.toggleCartDrawer)
  };
});

vi.mock('store/GlobalStore', () => {
  return {
    useStore: () => ({
      state: {
        cart: {
          items: []
        }
      }
    })
  };
});

const customProduct = (
  <div>
    <h1>Custom Header</h1>
    <p>Custom subtitle</p>
  </div>
);

describe('SubHeader', () => {
  setBrokerInfo(
    {
      brokerId: 1,
      brokerName: 'TestBrokerName',
      brokerFiscalCode: 'TestBrokerTaxCode',
      config: {
        translation: {},
        useCart: true
      }
    },
    'test'
  );

  it('calls toggleCartDrawer when the cart button is clicked', () => {
    render(<SubHeader product={customProduct} />);
    const cartButton = screen.getByTestId('ShoppingCartIcon');

    expect(cartState.value.isOpen).toBeFalsy();

    fireEvent.click(cartButton);

    expect(toggleCartDrawer).toHaveBeenCalled();
    expect(cartState.value.isOpen).toBeTruthy();
  });

  it('renders custom product content', () => {
    render(<SubHeader product={customProduct} />);

    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('Custom subtitle')).toBeInTheDocument();
  });
});
