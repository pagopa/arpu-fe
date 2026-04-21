import React, { useContext, useEffect, useState } from 'react';
import { Form, useField, useFormikContext } from 'formik';
import { BuildFormInputs, BuildFormState, CustomFormValues } from './config';
import { Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import 'dayjs/locale/it';
import { PaymentNoticeInfo } from '..';
import { useTranslation } from 'react-i18next';
import { SpontaneousFormField } from '../../../../generated/data-contracts';
import { ResponsiveCard } from 'components/ResponsiveCard';
import FormContext, { FormContextType } from '../FormContext';

export type CustomFormProps = {
  fieldBeans: SpontaneousFormField[];
  amountFieldName?: string;
};

const CustomForm = ({ fieldBeans, amountFieldName }: CustomFormProps) => {
  const [isFormReady, setIsFormReady] = useState(false);
  const context = useContext<FormContextType | null>(FormContext);
  const { t } = useTranslation();
  const { setFormikState } = useFormikContext<PaymentNoticeInfo>();
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');
  const [, , amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');

  const fields = BuildFormInputs(fieldBeans, !amountFieldName, amountFieldName);

  useEffect(() => {
    const direction =
      context?.step?.current && context?.step?.previous
        ? context?.step?.current > context?.step?.previous
          ? 1
          : -1
        : 0;
    // This means that the dinamic form will be reset only when the user goes back to the previous step
    const initialValues: CustomFormValues = BuildFormState(fieldBeans);
    if (direction > 0) {
      setFormikState((state) => {
        return {
          ...state,
          values: {
            // inverting the two lines makes the state of the dynamic fields persistent
            ...state.values,
            ...initialValues
          }
        };
      });
    }
    setIsFormReady(true);
  }, []);

  useEffect(() => () => {
    descriptionHelpers.setValue('');
    amountHelpers.setValue(0);
  }, []);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <ResponsiveCard variant="outlined">
          <Typography variant="body2" fontWeight={600} component="h3" mb={2}>
            {t('spontanei.form.steps.step3.custom.title')}
          </Typography>
          <Form>{isFormReady && <Stack gap={2}>{fields}</Stack>}</Form>
        </ResponsiveCard>
      </LocalizationProvider>
    </>
  );
};

export default CustomForm;
