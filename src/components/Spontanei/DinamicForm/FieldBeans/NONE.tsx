import React, { useContext, useEffect } from 'react';
import { TextField } from '@mui/material';
import { FieldBeanPros, buildDinamicValue } from '../config';
import { useField, useFormikContext } from 'formik';
import FormContext, { FormContextType } from 'components/Spontanei/FormContext';

const NONE = (props: FieldBeanPros & { allFields: FieldBean[] }) => {
  const { input, allFields = [] } = props;
  const { name, htmlLabel } = input;
  const [field, _, helpers] = useField(name);
  const { values } = useFormikContext();
  const context = useContext<FormContextType | null>(FormContext);
  const hasJoinTemplate = input.extraAttr?.join_template;

  const value = hasJoinTemplate
    ? buildDinamicValue(hasJoinTemplate, values, allFields)
    : field.value;

  useEffect(() => {
    if (hasJoinTemplate) helpers.setValue(value);
    // if (name === "sys_type") context?.setPaymentNoticeInfo({
    //   ...context.paymentNoticeInfo!,
    //   description: value,
    // });
  }, [value]);

  return (
    <TextField
      label={htmlLabel}
      variant="outlined"
      disabled
      value={value}
      name={name}
    />
  );
};

export default NONE;
