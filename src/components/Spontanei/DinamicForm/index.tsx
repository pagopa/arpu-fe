import React, { useContext, useEffect } from 'react';
import { Form, useFormikContext } from 'formik';
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
  const { t } = useTranslation();

  const { setFormikState } = useFormikContext<PaymentNoticeInfo>();
  const context = useContext<FormContextType | null>(FormContext);

  const fields = BuildFormInputs(fieldBeans, amountFieldName);
  const initialValues: CustomFormValues = BuildFormState(fieldBeans);

  useEffect(() => {
    const direction =
      context?.step?.current && context?.step?.previous
        ? context?.step?.current > context?.step?.previous
          ? 1
          : -1
        : 0;

    // This means that the dinamic form will be reset only when the user goes back to the previous step
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
  }, []);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <ResponsiveCard variant="outlined">
          <Typography variant="h6" mb={2}>
            {t('spontanei.form.steps.step3.custom.title')}
          </Typography>
          <Form>
            <Stack gap={2}>{fields}</Stack>
          </Form>
        </ResponsiveCard>
      </LocalizationProvider>
    </>
  );
};

export default CustomForm;
