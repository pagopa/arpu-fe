/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockExecute, mockReset, capturedCallbacks } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockReset: vi.fn(),
  capturedCallbacks: {
    onChange: undefined as ((token: string | null) => void) | undefined,
    onExpired: undefined as (() => void) | undefined,
    onErrored: undefined as (() => void) | undefined
  }
}));

vi.mock('react-google-recaptcha', async () => {
  const React = await import('react');
  return {
    default: React.forwardRef((props: any, ref: any) => {
      capturedCallbacks.onChange = props.onChange;
      capturedCallbacks.onExpired = props.onExpired;
      capturedCallbacks.onErrored = props.onErrored;

      React.useImperativeHandle(ref, () => ({
        execute: mockExecute,
        reset: mockReset
      }));

      return (
        <div data-testid="recaptcha-widget" data-sitekey={props.sitekey} data-size={props.size} />
      );
    })
  };
});

vi.mock('utils/config', () => ({
  default: {
    recaptchaSiteKey: 'test-site-key-123'
  }
}));

import { RecaptchaProvider, useRecaptcha, isRecaptchaEnabled } from './RecaptchaProvider';

/** Renders the useRecaptcha hook inside the RecaptchaProvider */
const renderWithProvider = () =>
  renderHook(() => useRecaptcha(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <RecaptchaProvider>{children}</RecaptchaProvider>
    )
  });

/** Simulates Google responding with a token via onChange callback */
const simulateGoogleToken = (token: string | null) => {
  act(() => {
    capturedCallbacks.onChange?.(token);
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  capturedCallbacks.onChange = undefined;
  capturedCallbacks.onExpired = undefined;
  capturedCallbacks.onErrored = undefined;
});

describe('RecaptchaProvider', () => {
  describe('rendering', () => {
    it('renders the invisible reCAPTCHA widget when site key is configured', () => {
      render(
        <RecaptchaProvider>
          <div>child content</div>
        </RecaptchaProvider>
      );

      const widget = screen.getByTestId('recaptcha-widget');
      expect(widget).toBeInTheDocument();
      expect(widget).toHaveAttribute('data-sitekey', 'test-site-key-123');
      expect(widget).toHaveAttribute('data-size', 'invisible');
    });

    it('renders children correctly', () => {
      render(
        <RecaptchaProvider>
          <span data-testid="child">Hello</span>
        </RecaptchaProvider>
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Hello');
    });
  });

  describe('isRecaptchaEnabled', () => {
    it('returns true when site key is present', () => {
      expect(isRecaptchaEnabled()).toBe(true);
    });
  });

  describe('useRecaptcha hook', () => {
    it('returns isEnabled as true when site key is configured', () => {
      const { result } = renderWithProvider();
      expect(result.current.isEnabled).toBe(true);
    });

    it('exposes executeRecaptcha as a function', () => {
      const { result } = renderWithProvider();
      expect(typeof result.current.executeRecaptcha).toBe('function');
    });
  });

  describe('executeRecaptcha flow', () => {
    it('calls execute() on the reCAPTCHA widget', async () => {
      const { result } = renderWithProvider();

      let tokenPromise: Promise<string | null>;
      act(() => {
        tokenPromise = result.current.executeRecaptcha();
      });

      expect(mockExecute).toHaveBeenCalledTimes(1);

      simulateGoogleToken('generated-token-abc');

      const token = await tokenPromise!;
      expect(token).toBe('generated-token-abc');
    });

    it('resets the widget after receiving a token', async () => {
      const { result } = renderWithProvider();

      let tokenPromise: Promise<string | null>;
      act(() => {
        tokenPromise = result.current.executeRecaptcha();
      });

      simulateGoogleToken('some-token');
      await tokenPromise!;

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('resolves with null when Google sends a null token', async () => {
      const { result } = renderWithProvider();

      let tokenPromise: Promise<string | null>;
      act(() => {
        tokenPromise = result.current.executeRecaptcha();
      });

      simulateGoogleToken(null);

      const token = await tokenPromise!;
      expect(token).toBeNull();
    });
  });

  describe('expiration handling', () => {
    it('resolves with null when the token expires before being consumed', async () => {
      const { result } = renderWithProvider();

      let tokenPromise: Promise<string | null>;
      act(() => {
        tokenPromise = result.current.executeRecaptcha();
      });

      act(() => {
        capturedCallbacks.onExpired?.();
      });

      const token = await tokenPromise!;
      expect(token).toBeNull();
    });

    it('does not throw if onExpired fires without a pending request', () => {
      render(
        <RecaptchaProvider>
          <div />
        </RecaptchaProvider>
      );

      expect(() => {
        act(() => {
          capturedCallbacks.onExpired?.();
        });
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('resolves with null when reCAPTCHA encounters an error', async () => {
      const { result } = renderWithProvider();

      let tokenPromise: Promise<string | null>;
      act(() => {
        tokenPromise = result.current.executeRecaptcha();
      });

      act(() => {
        capturedCallbacks.onErrored?.();
      });

      const token = await tokenPromise!;
      expect(token).toBeNull();
    });

    it('does not throw if onErrored fires without a pending request', () => {
      render(
        <RecaptchaProvider>
          <div />
        </RecaptchaProvider>
      );

      expect(() => {
        act(() => {
          capturedCallbacks.onErrored?.();
        });
      }).not.toThrow();
    });
  });

  describe('sequential executions', () => {
    it('supports multiple sequential token requests', async () => {
      const { result } = renderWithProvider();

      let promise1: Promise<string | null>;
      act(() => {
        promise1 = result.current.executeRecaptcha();
      });
      simulateGoogleToken('token-1');
      expect(await promise1!).toBe('token-1');

      let promise2: Promise<string | null>;
      act(() => {
        promise2 = result.current.executeRecaptcha();
      });
      simulateGoogleToken('token-2');
      expect(await promise2!).toBe('token-2');

      expect(mockExecute).toHaveBeenCalledTimes(2);
      expect(mockReset).toHaveBeenCalledTimes(2);
    });
  });

  describe('default context (no provider)', () => {
    it('returns null from executeRecaptcha when used outside the provider', async () => {
      const { result } = renderHook(() => useRecaptcha());

      const token = await result.current.executeRecaptcha();
      expect(token).toBeNull();
      expect(result.current.isEnabled).toBe(false);
    });
  });
});
