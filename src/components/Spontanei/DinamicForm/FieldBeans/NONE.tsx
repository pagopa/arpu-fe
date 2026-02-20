import React from 'react';
import { TextField } from '@mui/material';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const NONE = (props: computedPROPS) => {
  const { htmlLabel, name, value } = props;
  return <TextField label={htmlLabel} disabled value={value} name={name} sx={{ flexGrow: 1 }} />;
};

export default withComputedValues(NONE);
