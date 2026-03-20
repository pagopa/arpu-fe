import React, { useEffect, useMemo } from 'react';
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

export type CustomFormProps = {
  fieldBeans: SpontaneousFormField[];
  amountFieldName?: string;
};

const CustomForm = ({ fieldBeans, amountFieldName }: CustomFormProps) => {
  const { t } = useTranslation();

  const { setFormikState } = useFormikContext<PaymentNoticeInfo>();

  const fields = BuildFormInputs(fieldBeans, amountFieldName);
  const initialValues: CustomFormValues = BuildFormState(fieldBeans);

  const fieldBeansKey = useMemo(
    () =>
      fieldBeans
        .map((f) => f.name)
        .sort()
        .join(','),
    [fieldBeans]
  );

  useEffect(() => {
    setFormikState((state) => {
      const dynamicFieldNames = new Set(Object.keys(initialValues));
      const mergedValues: Record<string, unknown> = { ...state.values };

      dynamicFieldNames.forEach((fieldName) => {
        mergedValues[fieldName] = initialValues[fieldName];
      });

      return {
        ...state,
        values: mergedValues as typeof state.values
      };
    });
  }, [fieldBeansKey]);

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
