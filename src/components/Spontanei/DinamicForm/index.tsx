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

const DinamicForm = ({ fieldBeans, campoTotaleInclusoInXSD, formikRef }: DinamicFormProps) => {
  const [, , amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');

  const hasCustomImportField =
    fieldBeans.some((field) => field.name === 'importo') || Boolean(campoTotaleInclusoInXSD);
  const fields = BuildFormInputs(fieldBeans, !hasCustomImportField);
  const schema = BuildFormSchema(fieldBeans);

  const validate = (values) => {
    // causale update
    const { sys_type } = values;
    descriptionHelpers.setValue(sys_type);
    // importo update
    let amount;
    if (hasCustomImportField && campoTotaleInclusoInXSD) {
      amount = values[campoTotaleInclusoInXSD];
    } else {
      amount = values.importo;
    }
    if (amount) {
      amountHelpers.setValue(parseFloat(amount));
    }

    const errors = {};
    const result = schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => (errors[issue.path[0]] = issue.message));
    }
    console.log(errors);
    return errors;
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <Formik
          innerRef={formikRef}
          onSubmit={console.log}
          initialValues={BuildFormState(fieldBeans)}
          validate={validate}>
          <Form>
            <Stack gap={2}>{fields}</Stack>
          </Form>
        </Formik>
      </LocalizationProvider>
    </>
  );
};

export default DinamicForm;
