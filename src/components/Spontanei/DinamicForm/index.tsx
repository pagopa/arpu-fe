import React from 'react';
import { Formik, Form, useField } from 'formik';
import { BuildFormInputs, BuildFormSchema, BuildFormState } from './config';
import { Stack } from '@mui/material';
import { FormServizioDimaico } from './mockServiziDinamici';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

import 'dayjs/locale/it';
import { PaymentNoticeInfo } from '..';

type DinamicFormProps = FormServizioDimaico;

const DinamicForm = ({ fieldBeans, campoTotaleInclusoInXSD, setHasError }: DinamicFormProps) => {
  const [, , amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');

  const hasCustomImportField =
    fieldBeans.some((field) => field.name === 'importo') || Boolean(campoTotaleInclusoInXSD);
  const fields = BuildFormInputs(fieldBeans, !hasCustomImportField);
  const schema = BuildFormSchema(fieldBeans);

  const validate = (values) => {
    setHasError(false);
    // causale update
    const { sys_type } = values;
    descriptionHelpers.setValue(sys_type);

    // importo update
    let importo = 0;
    if (hasCustomImportField && campoTotaleInclusoInXSD) {
      importo = values[campoTotaleInclusoInXSD];
    } else {
      importo = values.importo;
    }
    if (importo) {
      amountHelpers.setValue(importo * 100);
    }

    const errors = {};
    const result = schema.safeParse(values);
    if (!result.success) {
      setHasError(true);
      result.error.issues.forEach((issue) => (errors[issue.path[0]] = issue.message));
    }
    return errors;
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <Formik
          onSubmit={console.log}
          initialValues={BuildFormState(fieldBeans)}
          validate={validate}>
          {({ values }) => {
            console.log(values);
            return (
              <Form>
                <Stack gap={2}>{fields}</Stack>
              </Form>
            );
          }}
        </Formik>
      </LocalizationProvider>
    </>
  );
};

export default DinamicForm;
