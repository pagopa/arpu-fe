import React, { useEffect } from 'react';
import { TextField } from '@mui/material';
import { FieldBeanPros, buildDinamicValue } from '../config';
import { useField, useFormikContext } from 'formik';

const NONE = (props: FieldBeanPros & { allFields: [] }) => {
  const { input, allFields = [] } = props;
  const { name, htmlLabel } = input;
  const [field, , helpers] = useField(name);
  const { values } = useFormikContext();
  const hasJoinTemplate = input.extraAttr?.join_template;

  const value = hasJoinTemplate
    ? buildDinamicValue(hasJoinTemplate, values, allFields)
    : field.value;

  useEffect(() => {
    if (hasJoinTemplate) helpers.setValue(value);
  }, [value]);

  return <TextField label={htmlLabel} variant="outlined" disabled value={value} name={name} />;
};

export default NONE;
