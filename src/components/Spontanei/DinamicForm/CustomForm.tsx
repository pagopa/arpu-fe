import { Card, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DinamicForm from '../DinamicForm';
import { PersonEntityType, SpontaneousFormField } from '../../../../generated/data-contracts';
import StaticFormSection from '../DebtorSection';
import Controls from '../Controls';
import { useFormikContext } from 'formik';
import { BuildFormSchema, CustomFormValues } from './config';
import * as z from 'zod';
import focusOnFirstError from '../utils/focusOnFirstError';

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }
  return true;
}

interface CustomFormProps {
  fields: SpontaneousFormField[];
  hasFlagAnonymousFiscalCode?: boolean;
  allowedEntityType?: PersonEntityType;
  amountFieldName?: string;
}

const CustomForm = (props: CustomFormProps) => {
  const { fields, amountFieldName, hasFlagAnonymousFiscalCode = false } = props;
  const { t } = useTranslation();
  const { values, validateForm, submitForm, setErrors } = useFormikContext();

  const customFormValuesSchema = BuildFormSchema(fields);

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
    const allErrors = { ...globalFormErrors, ...customFormErrors };
    setErrors(allErrors);
    const isValid = isEmpty(globalFormErrors || {}) && isEmpty(customFormErrors || {});
    if (!isValid) {
      focusOnFirstError(allErrors as Record<string, string>);
    }
    return isValid;
  };

  return (
    <>
      <Card variant="elevation">
        <Stack spacing={2} padding={2}>
          <Stack gap={1}>
            <Typography variant="h5" component="h2">
              {t('spontanei.form.steps.step3.title')}
            </Typography>
            <Typography variant="body2">{t('spontanei.form.steps.step3.description')}</Typography>
          </Stack>
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
