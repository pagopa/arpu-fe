/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDueDateField } from './useDueDateField';
import { datetools } from 'utils/datetools';

vi.mock('utils/datetools', () => ({
  datetools: {
    formatDate: vi.fn()
  }
}));

vi.mock('@pagopa/mui-italia', () => ({
  Tag: ({ value }: { value: string }) => <span data-testid="tag">{value}</span>
}));

describe('useDueDateField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(datetools.formatDate).mockReturnValue('13/11/2025');
  });

  it('returns formatted date when payment option has due date', () => {
    const paymentOptions = [{ dueDate: '2025-11-13T00:00:00Z' }];

    const { result } = renderHook(() => useDueDateField(paymentOptions as any));

    expect(result.current.label).toBe('app.debtPositions.debtPositionItem.dueDate');
    expect(datetools.formatDate).toHaveBeenCalledWith('2025-11-13T00:00:00Z');
    expect(result.current.value).toBe('13/11/2025');
  });

  it('returns tag component when no due date exists', () => {
    const paymentOptions = [{ dueDate: undefined }];

    const { result } = renderHook(() => useDueDateField(paymentOptions as any));

    expect(result.current.label).toBe('');
    expect(datetools.formatDate).not.toHaveBeenCalled();
    // Check that it's a React element (Tag component)
    expect(result.current.value).toBeTruthy();
  });

  it('handles empty payment options array', () => {
    const paymentOptions: any[] = [];

    const { result } = renderHook(() => useDueDateField(paymentOptions));

    expect(result.current.label).toBe('');
    expect(datetools.formatDate).not.toHaveBeenCalled();
  });
});
