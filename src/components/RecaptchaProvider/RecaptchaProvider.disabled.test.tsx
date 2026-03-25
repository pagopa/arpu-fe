/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * This file tests the RecaptchaProvider when the site key is empty (disabled).
 *
 * It lives in a separate file because `isRecaptchaEnabled` reads
 * `config.recaptchaSiteKey` into a module-level constant at import time.
 * Changing the mock after import has no effect on that constant.
 * By mocking config with an empty key BEFORE the module loads,
 * we ensure `isRecaptchaEnabled()` returns false from the start.
 */

const { mockExecute, mockReset } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockReset: vi.fn()
}));

vi.mock('react-google-recaptcha', async () => {
  const React = await import('react');
  return {
    default: React.forwardRef((props: any, ref: any) => {
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
    recaptchaSiteKey: ''
  }
}));

import { RecaptchaProvider, useRecaptcha, isRecaptchaEnabled } from './RecaptchaProvider';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecaptchaProvider (disabled)', () => {
  it('isRecaptchaEnabled returns false when site key is empty', () => {
    expect(isRecaptchaEnabled()).toBe(false);
  });

  it('does not render the reCAPTCHA widget', () => {
    const { queryByTestId } = render(
      <RecaptchaProvider>
        <div />
      </RecaptchaProvider>
    );

    expect(queryByTestId('recaptcha-widget')).not.toBeInTheDocument();
  });

  it('renders children even when disabled', () => {
    const { getByTestId } = render(
      <RecaptchaProvider>
        <span data-testid="child">Hello</span>
      </RecaptchaProvider>
    );

    expect(getByTestId('child')).toHaveTextContent('Hello');
  });

  it('executeRecaptcha returns null without calling the widget', async () => {
    const { result } = renderHook(() => useRecaptcha(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <RecaptchaProvider>{children}</RecaptchaProvider>
      )
    });

    const token = await result.current.executeRecaptcha();
    expect(token).toBeNull();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('useRecaptcha reports isEnabled as false', () => {
    const { result } = renderHook(() => useRecaptcha(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <RecaptchaProvider>{children}</RecaptchaProvider>
      )
    });

    expect(result.current.isEnabled).toBe(false);
  });
});
