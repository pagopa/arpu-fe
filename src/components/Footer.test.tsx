/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import { Footer } from './Footer';

vi.mock('hooks/useLanguage', () => ({
  useLanguage: vi.fn()
}));

vi.mock('utils/loaders', () => ({
  default: {
    public: {
      useBrokerInfo: vi.fn()
    }
  }
}));

vi.mock('./ProductLogo', () => ({
  ProductLogo: () => <div data-testid="product-logo">Logo</div>
}));

import loaders from 'utils/loaders';
import { ArcRoutes } from 'routes/routes';

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('ARPU-brokerId', '123');

    vi.mocked(loaders.public.useBrokerInfo).mockReturnValue({
      data: { brokerName: 'Test Broker S.p.A.' }
    } as any);
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

  it('renders links with correct href attributes', () => {
    render(<Footer />);

    const privacyLink = screen.getByText('ui.footer.privacy').closest('a');
    const tosLink = screen.getByText('ui.footer.termsAndConditions').closest('a');
    const a11yLink = screen.getByText('ui.footer.a11y').closest('a');
    const personalDataLink = screen.getByText('ui.footer.personalData').closest('a');

    expect(privacyLink).toHaveAttribute('href', ArcRoutes.PRIVACY_POLICY);
    expect(tosLink).toHaveAttribute('href', ArcRoutes.TOS);
    expect(a11yLink).toHaveAttribute(
      'href',
      'https://www.w3.org/WAI/standards-guidelines/wai-aria/'
    );
    expect(personalDataLink).toHaveAttribute(
      'href',
      'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8'
    );
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
    render(<Footer />);

    expect(screen.getByText('Test Broker S.p.A.')).toBeInTheDocument();
  });

  it('handles missing broker name gracefully', () => {
    vi.mocked(loaders.public.useBrokerInfo).mockReturnValue({
      data: undefined
    } as any);

    render(<Footer />);

    expect(screen.queryByText('Test Broker S.p.A.')).not.toBeInTheDocument();
  });
});
