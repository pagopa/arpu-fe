import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import { DateValidationError } from '@mui/x-date-pickers/models';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

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

const StyledDatePicker = styled(DatePicker)({
  '& .MuiInputBase-root': {
    backgroundColor: 'transparent'
  },
  '& .MuiFormHelperText-root': {
    position: 'absolute',
    bottom: '-20px',
    left: 0,
    margin: 0
  }
}) as typeof DatePicker;

const DateRangeContainer = styled(Box)({
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start'
});

export const DateRange = ({ from, to }: DateRangeProps) => {
  const [startDateError, setStartDateError] = useState<DateValidationError | null>(null);
  const [endDateError, setEndDateError] = useState<DateValidationError | null>(null);
  const [isToDialogOpen, setIsToDialogOpen] = useState(false);
  const { t } = useTranslation();

  const handleStartDateChange = (fromDate: DateRangeValue) => {
    from.onChange(fromDate ? fromDate.startOf('day') : null);
  };

  const handleStartDateOnAccept = (fromDate: DateRangeValue) => {
    if (fromDate && (!to.value?.isValid() || fromDate.isAfter(to.value))) {
      setIsToDialogOpen(true);
    }
  };

  const handleEndDateChange = (toDate: DateRangeValue) => {
    if (!toDate) {
      to.onChange(null);
      return;
    }

    if (!from.value?.isValid() || toDate.isSame(from.value) || toDate.isAfter(from.value)) {
      to.onChange(toDate.endOf('day'));
    }
  };

  const fromError = startDateError ? from.errorMessage || t('dates.validation') : '';
  const toError = endDateError ? to.errorMessage || t('dates.validation') : '';

  const commonSlotProps = {
    textField: {
      size: 'small' as const,
      variant: 'outlined' as const
    },
    openPickerIcon: {
      color: 'action' as const
    }
  };

  return (
    <DateRangeContainer>
      <StyledDatePicker
        label={t('dates.from')}
        value={from.value}
        onChange={handleStartDateChange}
        onAccept={handleStartDateOnAccept}
        onError={setStartDateError}
        slots={{ openPickerIcon: ArrowDropDownIcon }}
        slotProps={{
          ...commonSlotProps,
          textField: {
            ...commonSlotProps.textField,
            error: !!startDateError,
            helperText: fromError
          }
        }}
      />
      <StyledDatePicker
        label={t('dates.to')}
        value={to.value}
        onChange={handleEndDateChange}
        minDate={from.value ?? undefined}
        open={isToDialogOpen}
        onClose={() => setIsToDialogOpen(false)}
        onError={setEndDateError}
        slots={{ openPickerIcon: ArrowDropDownIcon }}
        slotProps={{
          ...commonSlotProps,
          textField: {
            ...commonSlotProps.textField,
            error: !!endDateError,
            helperText: toError
          },
          openPickerButton: {
            onClick: () => setIsToDialogOpen((open) => !open)
          }
        }}
      />
    </DateRangeContainer>
  );
};
