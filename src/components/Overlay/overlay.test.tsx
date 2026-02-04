import React from 'react';
import { render, screen, cleanup } from '../../__tests__/renderers';
import { Overlay } from '../Overlay';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Overlay Component', () => {
  beforeEach(() => {
    vi.spyOn(document.body.style, 'setProperty'); // Spy on body overflow manipulation
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render the loading spinner and background when visible is true', () => {
    render(<Overlay visible={true} />);

    // Check if the CircularProgress spinner is in the document
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();

    // Check if the background overlay is visible
    const overlay = screen.getByTestId('overlay-background');
    expect(overlay).toBeInTheDocument();
  });

  it('should not render anything when visible is false', () => {
    render(<Overlay visible={false} />);

    // Check that no elements related to the overlay or spinner are rendered
    const spinner = screen.queryByRole('status');
    const overlay = screen.queryByTestId('overlay-background');

    expect(spinner).not.toBeInTheDocument();
    expect(overlay).not.toBeInTheDocument();
  });

  it('should set body overflow to "hidden" when visible is true', () => {
    render(<Overlay visible={true} />);

    expect(getComputedStyle(document.body).overflow).toBe('hidden');
  });

  it('should reset body overflow to "auto" when visible is false', () => {
    render(<Overlay visible={false} />);

    expect(getComputedStyle(document.body).overflow).toBe('auto');
  });

  it('should clean up body overflow when unmounted', async () => {
    const { unmount, rerender } = render(<Overlay visible={true} />);
    rerender(<Overlay visible={false} />);
    unmount();
    expect(getComputedStyle(document.body).overflow).toBe('auto');
  });
});
