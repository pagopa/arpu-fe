import React from 'react';
import { TextField } from '@mui/material';
import utils from 'utils';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const CURRENCYLABEL = (props: computedPROPS) => {
  const { value, name } = props;
  //asserting value is a number(Euro in Cents)
  return (
    <TextField disabled value={utils.converters.toEuro(Number(value as string))} name={name} />
  );
};

export default withComputedValues(CURRENCYLABEL);
