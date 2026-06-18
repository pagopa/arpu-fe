import React from 'react';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useMediaQuery } from '@mui/material';
import { ResponsiveDrawer } from './index';

// Breakpoint helpers
const mockUseMediaQuery = vi.hoisted(() => vi.fn());

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    useMediaQuery: mockUseMediaQuery
  };
});

/**
 * useMediaQuery is called twice in order:
 *   1st call → isLg  (theme.breakpoints.up('lg'))
 *   2nd call → isMd  (theme.breakpoints.up('md'))
 */
const mockBreakpoint = (isLg: boolean, isMd: boolean) => {
  (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(isLg).mockReturnValueOnce(isMd);
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key })
}));

// Shared render helper

const renderDrawer = (props: Partial<React.ComponentProps<typeof ResponsiveDrawer>> = {}) =>
  render(
    <ResponsiveDrawer open={false} onOpen={vi.fn()} onClose={vi.fn()} {...props}>
      <div data-testid="drawer-content">Filter controls</div>
    </ResponsiveDrawer>
  );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ResponsiveDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── lg+ : inline rendering ─────────────────────────────────────────────────

  describe('lg+ (inline)', () => {
    beforeEach(() => mockBreakpoint(true, true));

    it('renders children directly without a drawer or trigger button', () => {
      renderDrawer();

      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /filters/i })).not.toBeInTheDocument();
    });

    it('does not render a Drawer element', () => {
      renderDrawer();
      // MUI Drawer renders with role="presentation" when open
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });
  });

  // ── md: right drawer ───────────────────────────────────────────────────────

  describe('md (right drawer)', () => {
    beforeEach(() => mockBreakpoint(false, true));

    it('renders the trigger button with the default label', () => {
      renderDrawer();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('renders the trigger button with a custom label', () => {
      renderDrawer({ label: 'Custom Filters' });
      expect(screen.getByRole('button', { name: /custom filters/i })).toBeInTheDocument();
    });

    it('calls onOpen when the trigger button is clicked', () => {
      const onOpen = vi.fn();
      renderDrawer({ onOpen });
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('does not show children when drawer is closed', () => {
      renderDrawer({ open: false });
      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
    });

    it('shows children inside the drawer when open', () => {
      renderDrawer({ open: true });
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('shows the drawer title as a heading when open', () => {
      renderDrawer({ open: true, label: 'My Filters' });
      expect(screen.getByRole('heading', { name: /my filters/i })).toBeInTheDocument();
    });

    it('calls onClose when the close button inside the drawer is clicked', () => {
      const onClose = vi.fn();
      renderDrawer({ open: true, onClose });
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the backdrop is clicked', () => {
      const onClose = vi.fn();
      renderDrawer({ open: true, onClose });
      // MUI Drawer fires onClose via the Backdrop click
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });

    it('has correct aria attributes on the trigger', () => {
      renderDrawer();
      const trigger = screen.getByRole('button', { name: /filters/i });
      expect(trigger.closest('[aria-haspopup="dialog"]')).toBeInTheDocument();
    });

    it('drawer has role=dialog and aria-modal when open', () => {
      renderDrawer({ open: true });
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  // ── xs: bottom drawer ──────────────────────────────────────────────────────

  describe('xs (bottom drawer)', () => {
    beforeEach(() => mockBreakpoint(false, false));

    it('renders the trigger button', () => {
      renderDrawer();
      expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    });

    it('shows children when open', () => {
      renderDrawer({ open: true });
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('calls onOpen when trigger is clicked', () => {
      const onOpen = vi.fn();
      renderDrawer({ onOpen });
      fireEvent.click(screen.getByRole('button', { name: /filters/i }));
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when the close button is clicked', () => {
      const onClose = vi.fn();
      renderDrawer({ open: true, onClose });
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
