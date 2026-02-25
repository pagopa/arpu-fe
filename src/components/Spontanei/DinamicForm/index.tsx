import React, { useEffect } from 'react';
import { Form, useFormikContext } from 'formik';
import { BuildFormInputs, BuildFormState, CustomFormValues } from './config';
import { Card, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import 'dayjs/locale/it';
import { PaymentNoticeInfo } from '..';
import { useTranslation } from 'react-i18next';
import { SpontaneousFormField } from '../../../../generated/data-contracts';

export type CustomFormProps = {
  fieldBeans: SpontaneousFormField[];
  amountFieldName?: string;
};

const CustomForm = ({ fieldBeans, amountFieldName }: CustomFormProps) => {
  const { values: prevValues, setFormikState, } = useFormikContext<PaymentNoticeInfo>();

  const fields = BuildFormInputs(fieldBeans, amountFieldName);

  const { t } = useTranslation();

  const initialValues: CustomFormValues = {
    ...BuildFormState(fieldBeans),
    debtPositionTypeOrgCode: prevValues.debtType?.code,
    fullName: prevValues.fullName,
    email: prevValues.email,
    fiscalCode: prevValues.fiscalCode,
    entityType: prevValues.entityType,
    debtPositionTypeOrgId: prevValues.debtType?.debtPositionTypeOrgId,
    debtPositionTypeOrgDescription: prevValues.debtType?.description,
    organizationId: prevValues.org?.organizationId,
    organizationName: prevValues.org?.orgName,
    orgFiscalCode: prevValues.org?.orgFiscalCode,
    ipaCode: prevValues.org?.ipaCode
  };

  useEffect(() => {
    setFormikState((state) => {
      return ({
        ...state,
        values: {
          ...state.values,
          ...initialValues
        }
      })
    })
  }, []);

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <Card variant="outlined" sx={{ padding: 3 }}>
          <Typography variant="h6" mb={2}>
            {t('spontanei.form.steps.step3.custom.title')}
          </Typography>
          <Form>
            <Stack gap={2}>{fields}</Stack>
          </Form>
        </Card>
      </LocalizationProvider>
    </>
  );
};

export default CustomForm;
