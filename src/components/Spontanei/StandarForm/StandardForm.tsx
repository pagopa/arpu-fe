import React, { useRef } from 'react';
import { Card, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DebtorSection from '../DebtorSection';
import { Formik, useField, useFormik, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';

const initialValues = {
  description: ''
};

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

const StandardForm = (props: { fixedAmount?: number; hasFlagAnonymousFiscalCode?: boolean }) => {
  const { t } = useTranslation();
  const { validateForm, submitForm } = useFormikContext();
  const [amount, amountMeta, amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');
  const formikRef = useRef<ReturnType<typeof useFormik<typeof initialValues>>>(null);

  useEffect(() => {
    if (props.fixedAmount !== undefined) {
      amountHelpers.setValue(props.fixedAmount / 100);
    } else {
      amountHelpers.setValue(0);
    }
  }, [props.fixedAmount]);

  const validate = (values: typeof initialValues) => {
    descriptionHelpers.setValue(`${values.description}`);
    const errors: Partial<typeof initialValues> = {};
    if (!values.description) {
      errors.description = t('spontanei.form.validation.required');
    }
    return errors;
  };

  const shouldContinue = async () => {
    await submitForm();
    const globalFormErrors = await validateForm();
    const localFormErrors = await formikRef.current?.validateForm();
    return isEmpty(globalFormErrors || {}) && isEmpty(localFormErrors || {});
  };

  return (
    <>
      <Card sx={{ padding: 3 }}>
        <Stack gap={2}>
          <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
          <Typography color="error.dark">
            {t('spontanei.form.steps.step3.requiredField')}
          </Typography>
        </Stack>

        <Stack gap={2}>
          <DebtorSection hasFlagAnonymousFiscalCode={props.hasFlagAnonymousFiscalCode || false} />
          <Formik
            initialValues={initialValues}
            validate={validate}
            onSubmit={console.log}
            innerRef={formikRef}>
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Card variant="outlined" sx={{ padding: 3 }}>
                <Stack gap={2}>
                  <Typography>{t('spontanei.form.steps.step3.paymentData.title')}</Typography>
                  <Stack direction="row" justifyContent={'space-between'} spacing={2}>
                    <TextField
                      size="small"
                      label={t('spontanei.form.steps.step3.paymentData.amount')}
                      variant="outlined"
                      required
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">€</InputAdornment>
                        }
                      }}
                      type="number"
                      disabled={props.fixedAmount !== undefined}
                      {...amount}
                      error={amountMeta.touched && Boolean(amountMeta.error)}
                      helperText={amountMeta.touched && amountMeta.error}
                    />
                    <TextField
                      size="small"
                      label={t('spontanei.form.steps.step3.paymentData.description')}
                      variant="outlined"
                      required
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      sx={{ width: '-webkit-fill-available' }}
                    />
                  </Stack>
                </Stack>
              </Card>
            )}
          </Formik>
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default StandardForm;
