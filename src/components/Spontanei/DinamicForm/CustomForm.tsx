import { Card, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DinamicForm from '../DinamicForm';
import { PersonEntityType, SpontaneousFormField } from '../../../../generated/data-contracts';
import StaticFormSection from '../DebtorSection';
import Controls from '../Controls';
import { useFormikContext } from 'formik';
import { BuildFormSchema, CustomFormValues } from './config';

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
  const { validateForm, submitForm } = useFormikContext();

  const schema = BuildFormSchema(fields);

  const validate = (values: CustomFormValues) => {
    try {
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

  const shouldContinue = async () => {
    await submitForm();
    const globalFormErrors = await validateForm();
    console.log('shouldContinue', globalFormErrors);
    return isEmpty(globalFormErrors || {});
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
            <DinamicForm
              fieldBeans={fields}
              amountFieldName={amountFieldName}
            />
          </Stack>
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default CustomForm;
