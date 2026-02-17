import React, { useEffect } from 'react';
import { TextField } from '@mui/material';
import { buildDinamicValue } from '../config';
import { useField, useFormikContext } from 'formik';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const NONE = (props: computedPROPS) => {
  const { value, hasJoinTemplate, joinTemplate, name, allFields = [] } = props;
  const [, , helpers] = useField(name);

  const { values } = useFormikContext();

  const innerValue =
    hasJoinTemplate && joinTemplate ? buildDinamicValue(joinTemplate, values, allFields) : value;

  useEffect(() => {
    if (hasJoinTemplate) helpers.setValue(value);
  }, [value]);

  return (
    <TextField
      variant="outlined"
      disabled
      value={innerValue}
      name={name}
      sx={{ display: 'block' }}
    />
  );
};

export default withComputedValues(NONE);
