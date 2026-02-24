import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const CURRENCY = (props: computedPROPS) => {
  const { value, name, htmlLabel, onChange, onBlur, hasError, required, errorMessage, isDisabled } =
    props;
  //asserting value is a number(Euro in Cents)
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
      onChange={onChange}
      onBlur={onBlur}
      error={hasError}
      required={required}
      helperText={hasError && errorMessage}
      sx={{ flexGrow: 1 }}
      value={Number(value as string)}
    />
  );
};

export default withComputedValues(CURRENCY);
