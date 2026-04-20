import { Card, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DinamicForm from '../DinamicForm';
import { PersonEntityType, SpontaneousFormField } from '../../../../generated/data-contracts';
import StaticFormSection from '../DebtorSection';
import Controls from '../Controls';
import { useFormikContext } from 'formik';
import { BuildFormSchema, CustomFormValues, isEmpty } from './config';
import * as z from 'zod';

interface CustomFormProps {
  fields: SpontaneousFormField[];
  hasFlagAnonymousFiscalCode?: boolean;
  allowedEntityType?: PersonEntityType;
  amountFieldName?: string;
}

const CustomForm = (props: CustomFormProps) => {
  const { fields, amountFieldName, hasFlagAnonymousFiscalCode = false } = props;
  const { t } = useTranslation();
  const { values, validateForm, submitForm, setErrors } = useFormikContext<CustomFormValues>();

  const customFormValuesSchema = BuildFormSchema(fields, amountFieldName);

  const validate = (values: CustomFormValues) => {
    const errors: Record<string | number, string> = {};
    const result = customFormValuesSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue: z.ZodIssue) => (errors[issue.path[0]] = issue.message));
    }
    return errors;
  };

  const shouldContinue = async () => {
    await submitForm();
    const globalFormErrors = await validateForm();
    const customFormErrors = validate(values);
    setErrors({ ...globalFormErrors, ...customFormErrors });
    return isEmpty(globalFormErrors || {}) && isEmpty(customFormErrors || {});
  };

  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
          <Stack direction="column" justifyContent={'space-between'} spacing={2}>
            <StaticFormSection
              allowedEntityType={props.allowedEntityType}
              hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode}
            />
            <DinamicForm fieldBeans={fields} amountFieldName={amountFieldName} />
          </Stack>
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default CustomForm;
