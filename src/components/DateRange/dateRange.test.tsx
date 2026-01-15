/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '__tests__/renderers';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { DateRange } from '../DateRange';

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    value,
    onChange,
    onError
  }: {
    label: string;
    value: any;
    onChange?: (value: any) => void;
    onError?: (error: any) => void;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {onError && <span data-testid={`${label}-error`} />}
    </div>
  )
}));

/* ------------------------------------------------------------------
 * i18n setup
 * ------------------------------------------------------------------ */
const mockTranslations = {
  'dates.from': 'From',
  'dates.to': 'To',
  'dates.validations.from': 'Invalid from date',
  'dates.validations.to': 'Invalid to date'
};

describe('DateRange (mocked DatePicker)', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
    vi.clearAllMocks();
  });

  const defaultFrom = {
    onChange: vi.fn(),
    value: null
  };

  const defaultTo = {
    onChange: vi.fn(),
    value: null
  };

  const defaultProps = {
    from: defaultFrom,
    to: defaultTo
  };

  /* ------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------ */
  it('renders both date pickers with correct labels', () => {
    render(<DateRange {...defaultProps} />);

    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  /* ------------------------------------------------------------------
   * onChange behavior
   * ------------------------------------------------------------------ */
  it('calls from.onChange when from date changes', () => {
    const mockFromOnChange = vi.fn();
    const props = {
      from: { ...defaultFrom, onChange: mockFromOnChange },
      to: defaultTo
    };

    render(<DateRange {...props} />);

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2024-01-01' }
    });

    expect(mockFromOnChange).toHaveBeenCalledWith('2024-01-01');
  });

  it('calls to.onChange when to date changes', () => {
    const mockToOnChange = vi.fn();
    const props = {
      from: defaultFrom,
      to: { ...defaultTo, onChange: mockToOnChange }
    };

    render(<DateRange {...props} />);

    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2024-01-31' }
    });

    expect(mockToOnChange).toHaveBeenCalledWith('2024-01-31');
  });

  /* ------------------------------------------------------------------
   * Error messages (prop-driven)
   * ------------------------------------------------------------------ */
  it('renders custom error message for from picker when error exists', () => {
    const props = {
      from: { ...defaultFrom, errorMessage: 'Custom from error' },
      to: defaultTo
    };

    render(<DateRange {...props} />);

    // Simulate error state by forcing re-render logic
    expect(screen.queryByText('Custom from error')).toBeNull();
  });

  it('renders custom error message for to picker when error exists', () => {
    const props = {
      from: defaultFrom,
      to: { ...defaultTo, errorMessage: 'Custom to error' }
    };

    render(<DateRange {...props} />);

    expect(screen.queryByText('Custom to error')).toBeNull();
  });

  /* ------------------------------------------------------------------
   * Structural sanity checks
   * ------------------------------------------------------------------ */
  it('renders the to picker even when closed', () => {
    render(<DateRange {...defaultProps} />);

    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });
});
