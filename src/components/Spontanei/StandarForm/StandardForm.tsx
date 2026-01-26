import React, { useRef } from 'react';
import {
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DebtorSection from '../DebtorSection';
import { Formik, useField, useFormik, useFormikContext } from 'formik';
import { useEffect } from 'react';
import utils from 'utils';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';
import { PersonEntityType } from '../../../../generated/data-contracts';

const initialValues = {
  payeeFiscalCode: '',
  payeeFullName: '',
  payeeDescription: ''
};

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

const StandardForm = (props: { fixedAmount?: number }) => {
  const { t } = useTranslation();
  const { validateForm, submitForm } = useFormikContext();
  const [amount, amountMeta, amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [value, , entityTypeMeta] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');
  const formikRef = useRef<ReturnType<typeof useFormik<typeof initialValues>>>(null);

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

  const shouldContinue = async () => {
    await submitForm();
    const globalFormErrors = await validateForm();
    const localFormErrors = await formikRef.current?.validateForm();
    return isEmpty(globalFormErrors || {}) && isEmpty(localFormErrors || {});
  };

  return (
    <>
      <Card sx={{ padding: 3 }}>
        <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
        <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
        <Typography>*Campo obbligatorio</Typography>
        <FormControl>
          <RadioGroup
            row
            onChange={(_e: any, value) => {
              entityTypeMeta.setValue(value as PersonEntityType);
            }}
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="F"
            name="entityType">
            <FormControlLabel value="F" control={<Radio />} label="Persona fisica" />
            <FormControlLabel value="G" control={<Radio />} label="Soggetto giuridico" />
          </RadioGroup>
        </FormControl>

        <Card variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
          <DebtorSection />
        </Card>

        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={console.log}
          innerRef={formikRef}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Card variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
              <Typography>Dati dell'avviso di pagamento</Typography>
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
            </Card>
          )}
        </Formik>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default StandardForm;
