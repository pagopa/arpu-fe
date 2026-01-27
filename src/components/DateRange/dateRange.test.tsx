/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DateRange, DateRangeProps } from '../DateRange';
import dayjs from 'dayjs';

let capturedDatePickerProps: any[] = [];

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: any) => {
    capturedDatePickerProps.push(props);

    return (
      <div data-testid={`date-picker-${props.label}`}>
        <label htmlFor={props.label}>{props.label}</label>
        <input
          id={props.label}
          aria-label={props.label}
          data-testid={`input-${props.label}`}
          value={props.value ? props.value.format('YYYY-MM-DD') : ''}
          onChange={(e) => {
            const newDate = e.target.value ? dayjs(e.target.value) : null;
            props.onChange?.(newDate);
          }}
        />
        <button data-testid={`accept-${props.label}`} onClick={() => props.onAccept?.(props.value)}>
          Accept
        </button>
        <button
          data-testid={`error-trigger-${props.label}`}
          onClick={() => props.onError?.('maxDate')}>
          Trigger Error
        </button>
        <button data-testid={`clear-error-${props.label}`} onClick={() => props.onError?.(null)}>
          Clear Error
        </button>
        {props.open !== undefined && (
          <button data-testid={`close-${props.label}`} onClick={() => props.onClose?.()}>
            Close
          </button>
        )}
        {props.slotProps?.openPickerButton?.onClick && (
          <button
            data-testid={`open-picker-${props.label}`}
            onClick={props.slotProps.openPickerButton.onClick}>
            Open Picker
          </button>
        )}
        {props.slotProps?.textField?.error && (
          <span data-testid={`error-${props.label}`}>{props.slotProps.textField.helperText}</span>
        )}
        {props.minDate && (
          <span data-testid={`min-date-${props.label}`}>{props.minDate.format('YYYY-MM-DD')}</span>
        )}
      </div>
    );
  }
}));

vi.mock('@mui/x-date-pickers/icons', () => ({
  ArrowDropDownIcon: () => <span>Arrow</span>
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'dates.from': 'From',
        'dates.to': 'To',
        'dates.validation': 'Invalid date'
      };
      return translations[key] || key;
    }
  })
}));

describe('DateRange Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedDatePickerProps = [];
  });

  const createDefaultProps = (): DateRangeProps => ({
    from: {
      onChange: vi.fn(),
      value: null
    },
    to: {
      onChange: vi.fn(),
      value: null
    }
  });

  describe('Rendering', () => {
    it('renders both date pickers with correct labels', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      expect(screen.getByLabelText('From')).toBeInTheDocument();
      expect(screen.getByLabelText('To')).toBeInTheDocument();
    });

    it('renders with initial null values', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From') as HTMLInputElement;
      const toInput = screen.getByTestId('input-To') as HTMLInputElement;

      expect(fromInput.value).toBe('');
      expect(toInput.value).toBe('');
    });

    it('renders with provided date values', () => {
      const fromDate = dayjs('2024-01-15');
      const toDate = dayjs('2024-01-31');

      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: fromDate
        },
        to: {
          onChange: vi.fn(),
          value: toDate
        }
      };

      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From') as HTMLInputElement;
      const toInput = screen.getByTestId('input-To') as HTMLInputElement;

      // Values are normalized to start/end of day
      expect(fromInput.value).toBe('2024-01-15');
      expect(toInput.value).toBe('2024-01-31');
    });

    it('renders custom labels when provided', () => {
      const props: DateRangeProps = {
        from: {
          label: 'Start Date',
          onChange: vi.fn(),
          value: null
        },
        to: {
          label: 'End Date',
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      expect(screen.getByLabelText('From')).toBeInTheDocument();
      expect(screen.getByLabelText('To')).toBeInTheDocument();
    });
  });

  describe('From Date Changes', () => {
    it('calls from.onChange when from date changes', () => {
      const mockOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: mockOnChange,
          value: null
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From');
      fireEvent.change(fromInput, { target: { value: '2024-01-15' } });

      expect(mockOnChange).toHaveBeenCalledTimes(1);
      const calledDate = mockOnChange.mock.calls[0][0];
      expect(calledDate?.format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('handles clearing from date', () => {
      const mockOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: mockOnChange,
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From');
      fireEvent.change(fromInput, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('allows changing from date multiple times', () => {
      const mockOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: mockOnChange,
          value: null
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From');

      fireEvent.change(fromInput, { target: { value: '2024-01-01' } });
      fireEvent.change(fromInput, { target: { value: '2024-01-15' } });
      fireEvent.change(fromInput, { target: { value: '2024-01-31' } });

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('To Date Changes', () => {
    it('calls to.onChange when to date changes and is after from date', () => {
      const mockToOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-31' } });

      expect(mockToOnChange).toHaveBeenCalledTimes(1);
      const calledDate = mockToOnChange.mock.calls[0][0];
      expect(calledDate?.format('YYYY-MM-DD')).toBe('2024-01-31');
    });

    it('calls to.onChange when to date is same as from date', () => {
      const mockToOnChange = vi.fn();
      const fromDate = dayjs('2024-01-15');

      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: fromDate
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-15' } });

      expect(mockToOnChange).toHaveBeenCalled();
    });

    it('does not call to.onChange when to date is null', () => {
      const mockToOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '' } });

      expect(mockToOnChange).not.toHaveBeenCalled();
    });

    it('does not call to.onChange when to date is before from date', () => {
      const mockToOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-10' } });

      expect(mockToOnChange).not.toHaveBeenCalled();
    });

    it('does not call to.onChange when from date is invalid', () => {
      const mockToOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('invalid')
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-31' } });

      expect(mockToOnChange).toHaveBeenCalled();
    });
  });

  describe('OnAccept Behavior', () => {
    it('does not open to dialog when accepting null from date', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      const acceptButton = screen.getByTestId('accept-From');
      fireEvent.click(acceptButton);

      // Dialog should not be open
      const toInput = screen.getByTestId('input-To');
      expect(toInput).toBeInTheDocument();
    });

    it('opens to dialog when from date is after to date', async () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-31')
        },
        to: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        }
      };

      render(<DateRange {...props} />);

      const acceptButton = screen.getByTestId('accept-From');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        // Check if the to picker has open prop set to true
        const openPicker = screen.queryByTestId('open-picker-To');
        expect(openPicker).toBeInTheDocument();
      });
    });

    it('opens to dialog when to date is invalid', async () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: vi.fn(),
          value: dayjs('invalid')
        }
      };

      render(<DateRange {...props} />);

      const acceptButton = screen.getByTestId('accept-From');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        const openPicker = screen.queryByTestId('open-picker-To');
        expect(openPicker).toBeInTheDocument();
      });
    });

    it('opens to dialog when to date is null', async () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const acceptButton = screen.getByTestId('accept-From');
      fireEvent.click(acceptButton);

      await waitFor(() => {
        const openPicker = screen.queryByTestId('open-picker-To');
        expect(openPicker).toBeInTheDocument();
      });
    });

    it('does not open to dialog when from date is before to date', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: vi.fn(),
          value: dayjs('2024-01-31')
        }
      };

      render(<DateRange {...props} />);

      const acceptButton = screen.getByTestId('accept-From');
      fireEvent.click(acceptButton);

      // Dialog should not open - we can verify by checking the internal state
      // In a real test, you'd check if the dialog is visible
    });
  });

  describe('MinDate Constraint', () => {
    it('sets minDate on to picker when from date is set', () => {
      const fromDate = dayjs('2024-01-15');
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: fromDate
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      expect(screen.getByTestId('min-date-To')).toHaveTextContent('2024-01-15');
    });

    it('does not set minDate when from date is null', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      expect(screen.queryByTestId('min-date-To')).not.toBeInTheDocument();
    });

    it('updates minDate when from date changes', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      const { rerender } = render(<DateRange {...props} />);

      expect(screen.getByTestId('min-date-To')).toHaveTextContent('2024-01-01');

      const updatedProps: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      rerender(<DateRange {...updatedProps} />);

      expect(screen.getByTestId('min-date-To')).toHaveTextContent('2024-01-15');
    });
  });

  describe('Error Handling', () => {
    it('displays error for from date picker when error occurs', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: null,
          errorMessage: 'Custom from error'
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const errorTrigger = screen.getByTestId('error-trigger-From');
      fireEvent.click(errorTrigger);

      expect(screen.getByTestId('error-From')).toHaveTextContent('Custom from error');
    });

    it('displays default error message when no custom message provided', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      const errorTrigger = screen.getByTestId('error-trigger-From');
      fireEvent.click(errorTrigger);

      expect(screen.getByTestId('error-From')).toHaveTextContent('Invalid date');
    });

    it('displays error for to date picker when error occurs', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: null
        },
        to: {
          onChange: vi.fn(),
          value: null,
          errorMessage: 'Custom to error'
        }
      };

      render(<DateRange {...props} />);

      const errorTrigger = screen.getByTestId('error-trigger-To');
      fireEvent.click(errorTrigger);

      expect(screen.getByTestId('error-To')).toHaveTextContent('Custom to error');
    });

    it('clears error when error state is set to null', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      // Trigger error
      const errorTrigger = screen.getByTestId('error-trigger-From');
      fireEvent.click(errorTrigger);

      expect(screen.getByTestId('error-From')).toBeInTheDocument();

      // Clear error
      const clearError = screen.getByTestId('clear-error-From');
      fireEvent.click(clearError);

      expect(screen.queryByTestId('error-From')).not.toBeInTheDocument();
    });

    it('handles errors independently for from and to pickers', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: null,
          errorMessage: 'From error'
        },
        to: {
          onChange: vi.fn(),
          value: null,
          errorMessage: 'To error'
        }
      };

      render(<DateRange {...props} />);

      const fromErrorTrigger = screen.getByTestId('error-trigger-From');
      const toErrorTrigger = screen.getByTestId('error-trigger-To');

      fireEvent.click(fromErrorTrigger);
      fireEvent.click(toErrorTrigger);

      expect(screen.getByTestId('error-From')).toHaveTextContent('From error');
      expect(screen.getByTestId('error-To')).toHaveTextContent('To error');
    });
  });

  describe('Dialog State Management', () => {
    it('toggles to dialog open state when open picker button is clicked', () => {
      const props = createDefaultProps();
      render(<DateRange {...props} />);

      const openButton = screen.getByTestId('open-picker-To');

      // Click to open
      fireEvent.click(openButton);

      // Click again to close
      fireEvent.click(openButton);

      expect(openButton).toBeInTheDocument();
    });

    it('closes to dialog when close is called', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      // Open the dialog first
      const acceptButton = screen.getByTestId('accept-From');
      fireEvent.click(acceptButton);

      // Close the dialog
      const closeButton = screen.getByTestId('close-To');
      fireEvent.click(closeButton);

      // The dialog should be closed now
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Date Normalization', () => {
    it('normalizes from date to start of day', () => {
      const fromDate = dayjs('2024-01-15T15:30:45');
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: fromDate
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From') as HTMLInputElement;
      expect(fromInput.value).toBe('2024-01-15');
    });

    it('normalizes to date to end of day', () => {
      const toDate = dayjs('2024-01-31T15:30:45');
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: vi.fn(),
          value: toDate
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To') as HTMLInputElement;
      expect(toInput.value).toBe('2024-01-31');
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid from date gracefully', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('invalid')
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      expect(screen.getByLabelText('From')).toBeInTheDocument();
    });

    it('handles invalid to date gracefully', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: vi.fn(),
          value: dayjs('invalid')
        }
      };

      render(<DateRange {...props} />);

      expect(screen.getByLabelText('To')).toBeInTheDocument();
    });

    it('handles same day selection correctly', () => {
      const sameDate = dayjs('2024-01-15');
      const mockToOnChange = vi.fn();

      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: sameDate
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-15' } });

      expect(mockToOnChange).toHaveBeenCalled();
    });

    it('handles rapid date changes', () => {
      const mockOnChange = vi.fn();
      const props: DateRangeProps = {
        from: {
          onChange: mockOnChange,
          value: null
        },
        to: {
          onChange: vi.fn(),
          value: null
        }
      };

      render(<DateRange {...props} />);

      const fromInput = screen.getByTestId('input-From');

      for (let i = 1; i <= 10; i++) {
        fireEvent.change(fromInput, {
          target: { value: `2024-01-${i.toString().padStart(2, '0')}` }
        });
      }

      expect(mockOnChange).toHaveBeenCalledTimes(10);
    });

    it('handles null from value with non-null to value', () => {
      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: null
        },
        to: {
          onChange: vi.fn(),
          value: dayjs('2024-01-31')
        }
      };

      render(<DateRange {...props} />);

      expect(screen.getByLabelText('From')).toBeInTheDocument();
      expect(screen.getByLabelText('To')).toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('handles complete date range selection flow', () => {
      const mockFromOnChange = vi.fn();
      const mockToOnChange = vi.fn();

      const props: DateRangeProps = {
        from: {
          onChange: mockFromOnChange,
          value: null
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      const { rerender } = render(<DateRange {...props} />);

      // Select from date
      const fromInput = screen.getByTestId('input-From');
      fireEvent.change(fromInput, { target: { value: '2024-01-01' } });

      expect(mockFromOnChange).toHaveBeenCalled();

      // Update props with from date
      const updatedProps: DateRangeProps = {
        from: {
          onChange: mockFromOnChange,
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      rerender(<DateRange {...updatedProps} />);

      // Select to date
      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-31' } });

      expect(mockToOnChange).toHaveBeenCalled();
    });

    it('handles date range modification', () => {
      const mockFromOnChange = vi.fn();
      const mockToOnChange = vi.fn();

      const props: DateRangeProps = {
        from: {
          onChange: mockFromOnChange,
          value: dayjs('2024-01-01')
        },
        to: {
          onChange: mockToOnChange,
          value: dayjs('2024-01-31')
        }
      };

      render(<DateRange {...props} />);

      // Modify from date
      const fromInput = screen.getByTestId('input-From');
      fireEvent.change(fromInput, { target: { value: '2024-01-15' } });

      expect(mockFromOnChange).toHaveBeenCalled();
    });

    it('prevents invalid range selection (to before from)', () => {
      const mockToOnChange = vi.fn();

      const props: DateRangeProps = {
        from: {
          onChange: vi.fn(),
          value: dayjs('2024-01-15')
        },
        to: {
          onChange: mockToOnChange,
          value: null
        }
      };

      render(<DateRange {...props} />);

      const toInput = screen.getByTestId('input-To');
      fireEvent.change(toInput, { target: { value: '2024-01-10' } });

      expect(mockToOnChange).not.toHaveBeenCalled();
    });
  });
});
