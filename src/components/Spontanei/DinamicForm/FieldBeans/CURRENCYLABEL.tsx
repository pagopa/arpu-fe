import React from 'react';
import { TextField } from '@mui/material';
import utils from 'utils';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const CURRENCYLABEL = (props: computedPROPS) => {
  const { value, name } = props;
  return <TextField disabled value={utils.converters.toEuro(Number(value) * 100)} name={name} />;
};

export default withComputedValues(CURRENCYLABEL);
