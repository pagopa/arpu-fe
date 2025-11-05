import React, { useContext } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from './FormContext';

const Controls = (props: { shouldContinue: () => Promise<boolean> }) => {
  const { t } = useTranslation();
  const context = useContext<FormContextType | null>(FormContext);
  const step = context?.step || 0;

  const onBack = () => {
    context?.setStep(step - 1);
  };

  const onContinue = async () => {
    const canContinue = await props.shouldContinue();
    if (canContinue) {
      context?.setStep(step + 1);
    } 
  };

  return (
    <Stack direction="row" justifyContent={'space-between'}>
      <Button size="large" variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
        {step === 0 ? t('spontanei.form.abort') : t('spontanei.form.back')}
      </Button>
      <Button size="large" variant="contained" onClick={onContinue}>
        {t('spontanei.form.continue')}
      </Button>
    </Stack>
  );
};
export default Controls;
