import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { DateValidationError } from '@mui/x-date-pickers/models';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dayjs } from 'dayjs';

export type DateRangeValue = Dayjs | null;

export type DateRange = {
  label?: string;
  errorMessage?: string;
  onChange: (date: DateRangeValue) => void;
  value: DateRangeValue;
};

export type DateRangeProps = {
  from: DateRange;
  to: DateRange;
};

export const DateRange = ({ from, to }: DateRangeProps) => {
  const [startDateError, setStartDateError] = useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(null);
  const [isToDialogOpen, setIsToDialogOpen] = useState(false);

  const { t } = useTranslation();

  const handleStartDateChange = (fromDate: Dayjs | null) => {
    if (!fromDate) {
      from.onChange(null);
      return;
    }

    const fromValue = fromDate.startOf('day');
    from.onChange(fromValue);
  };

  const handleStartDateOnAccept = (fromDate: Dayjs | null) => {
    if (!fromDate) return;

    if (!to.value?.isValid() || fromDate.isAfter(to.value)) {
      setIsToDialogOpen(true);
    }
  };

  const handleEndDateChange = (toDate: Dayjs | null) => {
    if (!toDate) {
      to.onChange(null);
      return;
    }

    if (!from.value?.isValid() || toDate.isSame(from.value) || toDate.isAfter(from.value)) {
      const toValue = toDate.endOf('day');
      to.onChange(toValue);
    }
  };

  return (
    <>
      <DatePicker
        label={t('dates.from')}
        value={from.value}
        onChange={handleStartDateChange}
        onAccept={handleStartDateOnAccept}
        onError={setStartDateError}
        slots={{ openPickerIcon: ArrowDropDownIcon }}
        slotProps={{
          openPickerIcon: {
            color: 'action'
          },
          openPickerButton: {
            sx: {
              backgroundColor: 'transparent'
            }
          },
          textField: {
            size: 'small',
            variant: 'outlined',
            error: !!startDateError,
            helperText: startDateError ? from.errorMessage || t('dates.validation') : '',
            FormHelperTextProps: {
              sx: {
                position: 'absolute',
                bottom: '-20px',
                left: 0,
                margin: 0
              }
            }
          }
        }}
      />

      <DatePicker
        label={t('dates.to')}
        value={to.value}
        onChange={handleEndDateChange}
        minDate={from.value ?? undefined}
        open={isToDialogOpen}
        onClose={() => setIsToDialogOpen(false)}
        onError={setEndDateError}
        slots={{ openPickerIcon: ArrowDropDownIcon }}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
            error: !!endDateError,
            helperText: endDateError ? to.errorMessage || t('dates.validation') : '',
            FormHelperTextProps: {
              sx: {
                position: 'absolute',
                bottom: '-20px',
                left: 0,
                margin: 0
              }
            }
          },
          openPickerIcon: {
            color: 'action'
          },
          openPickerButton: {
            sx: {
              backgroundColor: 'transparent'
            },
            onClick: () => setIsToDialogOpen((open) => !open)
          }
        }}
      />
    </>
  );
};
