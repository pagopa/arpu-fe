import React from 'react';
import { TextField } from '@mui/material';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const TEXT = (props: computedPROPS) => {
  const { name, value, onChange, onBlur } = props;

  return (
    <TextField
      variant="outlined"
      value={value}
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      sx={{ flexGrow: 1 }}
    />
  );
};

export default withComputedValues(TEXT);
