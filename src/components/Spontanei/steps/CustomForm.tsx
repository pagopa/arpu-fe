import { Card, Stack, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DinamicForm from '../DinamicForm';
import { SpontaneousFormField } from '../../../../generated/arpu-be/data-contracts';
import StaticFormSection from '../StaticFormSection';

const CustomForm = (props: { fields: SpontaneousFormField[]; amountFieldName?: string }) => {
  const { t } = useTranslation();

  return (
    <Card variant="outlined">
      <Stack spacing={2} padding={4}>
        <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
        <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
        <Stack direction="column" justifyContent={'space-between'} spacing={2}>
          <DinamicForm fieldBeans={props.fields} campoTotaleInclusoInXSD={props.amountFieldName} />
          <StaticFormSection />
        </Stack>
      </Stack>
    </Card>
  );
};

export default CustomForm;
