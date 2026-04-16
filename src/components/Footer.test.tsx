/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import { Footer } from './Footer';

vi.mock('hooks/useLanguage', () => ({
  useLanguage: vi.fn(() => ({ language: 'test', changeLanguage: vi.fn() }))
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
  });

  it('renders external links with target blank and rel attributes', () => {
    render(<Footer />);

    const a11yLink = screen.getByText('ui.footer.a11y').closest('a');

    expect(a11yLink).toHaveAttribute('target', '_blank');
    expect(a11yLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders default a11y link when brokerInfo has no a11yLink', () => {
    render(<Footer />);

    const a11yLink = screen.getByText('ui.footer.a11y').closest('a');
    expect(a11yLink).toHaveAttribute(
      'href',
      'https://www.w3.org/WAI/standards-guidelines/wai-aria/'
    );
  });

  it('renders a11y link from brokerInfo config when available', () => {
    setBrokerInfo(
      {
        brokerName: 'Test Broker S.p.A.',
        brokerFiscalCode: 'ABC',
        config: {
          a11yLink: 'https://custom-a11y.example.com',
          translation: {}
        },
        brokerId: 0,
        externalId: ''
      },
      'test-broker'
    );
    render(<Footer />);

    const a11yLink = screen.getByText('ui.footer.a11y').closest('a');
    expect(a11yLink).toHaveAttribute('href', 'https://custom-a11y.example.com');
  });

  it('renders broker name', () => {
    setBrokerInfo(
      {
        brokerName: 'Test Broker S.p.A.',
        brokerFiscalCode: 'ABC',
        brokerId: 0,
        externalId: ''
      },
      'test-broker'
    );
    render(<Footer />);

    expect(screen.getByText('Test Broker S.p.A.')).toBeInTheDocument();
  });

  it('handles missing broker name gracefully', () => {
    resetAppStore();
    render(<Footer />);

    expect(screen.queryByText('Test Broker S.p.A.')).not.toBeInTheDocument();
  });
});
