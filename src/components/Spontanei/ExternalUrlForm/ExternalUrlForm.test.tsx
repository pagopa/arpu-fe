import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import ExternalUrlForm from './ExternalUrlForm';
import { render, screen } from '__tests__/renderers';

vi.mock('../Controls.tsx', () => ({
  default: () => <div data-testid="controls" />
}));

describe('ExternalUrlForm', () => {
  it('renders the title and the link with the correct attributes', () => {
    render(<ExternalUrlForm link="https://example.com" />);

    expect(screen.getByText('External URL')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /open link/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it('renders the Controls component', () => {
    render(<ExternalUrlForm link="https://example.com" />);
    expect(screen.getByTestId('controls')).toBeInTheDocument();
  });
});
