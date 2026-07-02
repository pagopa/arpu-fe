import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from '.';
import { cartState, resetCart } from 'store/CartStore';

describe('Cart route', () => {
  beforeEach(resetCart);

  it('opens the cart drawer on mount', () => {
    expect(cartState.value.isOpen).toBe(false);
    render(<Cart />);
    expect(cartState.value.isOpen).toBe(true);
  });

  it('closes the cart drawer on unmount', () => {
    const { unmount } = render(<Cart />);
    expect(cartState.value.isOpen).toBe(true);
    unmount();
    expect(cartState.value.isOpen).toBe(false);
  });

  it('renders a full-height placeholder so header/footer stay anchored', () => {
    const { container } = render(<Cart />);
    const box = container.firstChild as HTMLElement;
    expect(box).toBeInTheDocument();
    expect(box).toHaveStyle({ minHeight: '100vh' });
  });
});
