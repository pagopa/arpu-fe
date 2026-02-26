/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import { Footer } from './Footer';

vi.mock('hooks/useLanguage', () => ({
  useLanguage: vi.fn()
}));

vi.mock('./ProductLogo', () => ({
  ProductLogo: () => <div data-testid="product-logo">Logo</div>
}));

import { resetAppStore, setBrokerInfo } from 'store/appStore';

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('ARPU-brokerId', '123');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders product logo', () => {
    render(<Footer />);

    expect(screen.getByTestId('product-logo')).toBeInTheDocument();
  });

  it('renders all footer links', () => {
    render(<Footer />);

    expect(screen.getByText('ui.footer.privacy')).toBeInTheDocument();
    expect(screen.getByText('ui.footer.termsAndConditions')).toBeInTheDocument();
    expect(screen.getByText('ui.footer.a11y')).toBeInTheDocument();
    expect(screen.getByText('ui.footer.personalData')).toBeInTheDocument();
  });

  it('renders external links with target blank and rel attributes', () => {
    render(<Footer />);

    const a11yLink = screen.getByText('ui.footer.a11y').closest('a');
    const personalDataLink = screen.getByText('ui.footer.personalData').closest('a');

    expect(a11yLink).toHaveAttribute('target', '_blank');
    expect(a11yLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(personalDataLink).toHaveAttribute('target', '_blank');
    expect(personalDataLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders broker name', () => {
    setBrokerInfo({ brokerName: 'Test Broker S.p.A.', brokerFiscalCode: 'ABC' });
    render(<Footer />);

    expect(screen.getByText('Test Broker S.p.A.')).toBeInTheDocument();
  });

  it('handles missing broker name gracefully', () => {
    resetAppStore();
    render(<Footer />);

    expect(screen.queryByText('Test Broker S.p.A.')).not.toBeInTheDocument();
  });
});
