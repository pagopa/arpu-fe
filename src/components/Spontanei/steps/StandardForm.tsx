import React from 'react';
import { Card, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StaticFormSection from '../StaticFormSection';
import { Formik, useField } from 'formik';
import { useEffect } from 'react';
import utils from 'utils';
import { PaymentNoticeInfo } from '../Form';

const initialValues = {
  payeeFiscalCode: '',
  payeeFullName: '',
  payeeDescription: ''
};

const StandardForm = (props: { fixedAmount?: number }) => {
  const { t } = useTranslation();
  const [amount, amountMeta, amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');

  useEffect(() => {
    if (props.fixedAmount !== undefined) {
      amountHelpers.setValue(props.fixedAmount);
    } else {
      amountHelpers.setValue(0);
    }
  }, [props.fixedAmount]);

  const validate = (values: typeof initialValues) => {
    descriptionHelpers.setValue(
      `${values.payeeFullName}#${values.payeeFiscalCode}#${values.payeeDescription}`
    );
    const errors: Partial<typeof initialValues> = {};
    if (!values.payeeFullName) {
      errors.payeeFullName = t('spontanei.form.validation.required');
    }
    if (!values.payeeFiscalCode) {
      errors.payeeFiscalCode = t('spontanei.form.validation.required');
    }
    if (!values.payeeDescription) {
      errors.payeeDescription = t('spontanei.form.validation.required');
    }
    return errors;
  };

  return (
    <>
      <Formik initialValues={initialValues} validate={validate} onSubmit={console.log}>
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Card variant="outlined">
            <Stack spacing={2} padding={4}>
              <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
              <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
              <Stack direction="row" justifyContent={'space-between'} spacing={2}>
                <TextField
                  label="Nome Cognome / Ragione Sociale"
                  variant="outlined"
                  required
                  name="payeeFullName"
                  value={values.payeeFullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.payeeFullName)}
                  helperText={touched.payeeFullName && errors.payeeFullName}
                  sx={{ width: '-webkit-fill-available' }}
                />
                <TextField
                  label="Codice Fiscale / Partita IVA"
                  variant="outlined"
                  required
                  name="payeeFiscalCode"
                  value={values.payeeFiscalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.payeeFiscalCode)}
                  helperText={touched.payeeFiscalCode && errors.payeeFiscalCode}
                  sx={{ width: '-webkit-fill-available' }}
                />
              </Stack>
              <Stack direction="row" justifyContent={'space-between'} spacing={2}>
                <TextField
                  label="Importo (€)"
                  variant="outlined"
                  required
                  name="amount"
                  disabled={props.fixedAmount !== undefined}
                  value={utils.converters.toEuro(amount.value)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={amountMeta.touched && Boolean(amountMeta.error)}
                  helperText={amountMeta.touched && amountMeta.error}
                />
                <TextField
                  label="Causale"
                  variant="outlined"
                  required
                  name="payeeDescription"
                  value={values.payeeDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.payeeDescription)}
                  helperText={touched.payeeDescription && errors.payeeDescription}
                  sx={{ width: '-webkit-fill-available' }}
                />
              </Stack>
            </Stack>
          </Card>
        )}
      </Formik>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <StaticFormSection />
        </Stack>
      </Card>
    </>
  );
};

export default StandardForm;
