import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useField } from 'formik';
import React from 'react';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const DATEPICKER = (props: computedPROPS) => {
  const { name, extraAttr, value } = props;
  const [, , { setValue }] = useField(name);
  const dateFormat = extraAttr?.dateFormat;
  return (
    <DatePicker
      sx={{ width: '-webkit-fill-available' }}
      format={dateFormat}
      value={value ? dayjs(value) : undefined}
      onChange={(value) => {
        setValue(value?.format(dateFormat) || '');
      }}
    />
  );
};

export default withComputedValues(DATEPICKER);
