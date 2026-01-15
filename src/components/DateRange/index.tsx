import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { PickerValue } from '@mui/x-date-pickers/internals/models';
import { DateValidationError } from '@mui/x-date-pickers/models';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type DateRange = {
  label?: string;
  errorMessage?: string;
  onChange: (date: PickerValue) => void;
  value: PickerValue | null;
};

export type DateRangeProps = {
  from: DateRange;
  to: DateRange;
};

export const DateRange = ({ from, to }: DateRangeProps) => {
  const [startDateError, setStartDateError] = useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(null);

  const [isToDialogOpen, setIsToDialogOpen] = useState<boolean>(false);

  const { t } = useTranslation();

  const handleStartDateChange = (fromDate: PickerValue) => {
    from.onChange(fromDate);
  };

  const handleStartDateOnAccept = (fromDate: PickerValue) => {
    if (!to.value?.isValid() || fromDate?.isAfter(to.value)) {
      setIsToDialogOpen(true);
    }
  };

  const handleEndDateChange = (toDate: PickerValue) => {
    if (!from.value?.isValid() || toDate?.isSame(from.value) || toDate?.isAfter(from.value)) {
      to?.onChange?.(toDate);
    }
  };

  return (
    <>
      <DatePicker
        label={t('dates.from')}
        onAccept={handleStartDateOnAccept}
        onError={setStartDateError}
        slots={{ openPickerIcon: ArrowDropDownIcon }}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'outlined',
            error: !!startDateError,
            helperText: startDateError ? from?.errorMessage || t('dates.validations.from') : ''
          },
          openPickerIcon: {
            color: 'action'
          },
          openPickerButton: {
            sx: {
              backgroundColor: 'transparent'
            }
          }
        }}
        {...from}
        value={from?.value}
        onChange={handleStartDateChange}
      />
      {to && (
        <DatePicker
          label={t('dates.to')}
          key={`to-${to.value?.toString()}`}
          open={isToDialogOpen}
          onClose={() => setIsToDialogOpen(false)}
          minDate={from?.value || undefined}
          onError={setEndDateError}
          slots={{ openPickerIcon: ArrowDropDownIcon }}
          slotProps={{
            textField: {
              size: 'small',
              variant: 'outlined',
              error: !!endDateError,
              helperText: endDateError ? to?.errorMessage || t('dates.validations.to') : ''
            },
            openPickerIcon: {
              color: 'action'
            },
            openPickerButton: {
              sx: {
                backgroundColor: 'transparent'
              },
              onClick: () => setIsToDialogOpen(!isToDialogOpen)
            }
          }}
          {...to}
          value={to.value}
          onChange={handleEndDateChange}
        />
      )}
    </>
  );
};
