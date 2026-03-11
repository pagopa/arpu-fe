import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import withComputedValues, { computedPROPS } from './withDinamicValues';
import { useField } from 'formik';

export const CURRENCY = (props: computedPROPS) => {
  //asserting value is a number(Euro in Cents)
  const { value, name, htmlLabel, onBlur, hasError, required, errorMessage, isDisabled } = props;

  const [, , helpers] = useField<number>(name);
  return (
    <TextField
      disabled={isDisabled}
      type="number"
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">€</InputAdornment>
        }
      }}
      label={htmlLabel}
      name={name}
      onChange={(e) => {
        const value = Number(e.target.value);
        helpers.setValue(value * 100);
      }}
      onBlur={onBlur}
      error={hasError}
      required={required}
      helperText={hasError && errorMessage}
      sx={{ flexGrow: 1 }}
      value={(value as number) / 100}
    />
  );
};

export default withComputedValues(CURRENCY);
