import React from 'react';
import { Formik, Form, useField, useFormikContext } from 'formik';
import { BuildFormInputs, BuildFormSchema, BuildFormState, CustomFormValues } from './config';
import { Card, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import 'dayjs/locale/it';
import { PaymentNoticeInfo } from '..';
import { useTranslation } from 'react-i18next';
import { SpontaneousFormField } from '../../../../generated/data-contracts';

export type CustomFormProps = {
  fieldBeans: SpontaneousFormField[];
  campoTotaleInclusoInXSD?: string;
  formikRef?: React.Ref<unknown>;
};

const CustomForm = ({ fieldBeans, campoTotaleInclusoInXSD, formikRef }: CustomFormProps) => {
  const { values: prevValues } = useFormikContext<PaymentNoticeInfo>();
  const [, , amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');

  const hasCustomImportField =
    fieldBeans.some((field) => field.name === 'importo') || Boolean(campoTotaleInclusoInXSD);
  const fields = BuildFormInputs(fieldBeans, !hasCustomImportField);
  const schema = BuildFormSchema(fieldBeans);

  const validate = (values: CustomFormValues) => {
    try {
      // causale update
      const { sys_type } = values;
      if (typeof sys_type === 'string') {
        descriptionHelpers.setValue(sys_type);
      } else {
        throw new Error(`An errror occurred trying to update the sys_type field: ${sys_type}`);
      }
      // importo update
      let amount;
      if (hasCustomImportField && campoTotaleInclusoInXSD) {
        amount = values[campoTotaleInclusoInXSD];
      } else {
        amount = values.importo;
      }
      if (typeof amount === 'number') {
        amountHelpers.setValue(amount);
      } else {
        throw new Error(`An errror occurred trying to update the amount field: ${amount}`);
      }
      const errors = {};
      const result = schema.safeParse(values);
      if (!result.success) {
        result.error.issues.forEach((issue) => (errors[issue.path[0]] = issue.message));
      }
      console.log(errors);
      return errors;
    } catch (e) {
      console.error(e);
      return {};
    }
  };

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

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <Card variant="outlined" sx={{ padding: 3 }}>
          <Typography variant="h6" mb={2}>
            {t('spontanei.form.steps.step3.custom.title')}
          </Typography>
          <Formik
            innerRef={formikRef}
            onSubmit={console.log}
            initialValues={initialValues}
            validate={validate}>
            <Form>
              <Stack gap={2}>{fields}</Stack>
            </Form>
          </Formik>
        </Card>
      </LocalizationProvider>
    </>
  );
};

export default CustomForm;
