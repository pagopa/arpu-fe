import { Card, Stack, Typography } from '@mui/material';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DinamicForm from '../DinamicForm';
import { SpontaneousFormField } from '../../../../generated/data-contracts';
import StaticFormSection from '../DebtorSection';
import Controls from '../Controls';
import { useFormikContext } from 'formik';

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
  amountFieldName?: string;
}

const CustomForm = (props: CustomFormProps) => {
  const { fields, amountFieldName, hasFlagAnonymousFiscalCode = false } = props;
  const formikRef = useRef(null);
  const { t } = useTranslation();
  const { validateForm, submitForm } = useFormikContext();

  const shouldContinue = async () => {
    await submitForm();
    const globalFormErrors = await validateForm();
    await formikRef.current?.submitForm();
    const localFormErrors = await formikRef.current?.validateForm();
    return isEmpty(globalFormErrors || {}) && isEmpty(localFormErrors || {});
  };

  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
          <Stack direction="column" justifyContent={'space-between'} spacing={2}>
            <StaticFormSection hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode} />
            <DinamicForm
              fieldBeans={fields}
              campoTotaleInclusoInXSD={amountFieldName}
              formikRef={formikRef}
            />
          </Stack>
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default CustomForm;
