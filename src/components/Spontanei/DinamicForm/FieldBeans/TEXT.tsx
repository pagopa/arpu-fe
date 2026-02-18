import React from 'react';
import { TextField } from '@mui/material';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const TEXT = (props: computedPROPS) => {
  const { name, value, onChange, onBlur, htmlLabel, errorMessage = '', hasError, required } = props;

  return (
    <TextField
      label={htmlLabel}
      value={value}
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      error={hasError}
      required={required}
      helperText={hasError && errorMessage}
      sx={{ flexGrow: 1 }}
    />
  );
};

export default withComputedValues(TEXT);
