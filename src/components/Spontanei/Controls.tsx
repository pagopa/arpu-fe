import React, { useContext } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from './FormContext';

type HideContinue = {
  hideContinue: true;
};

type ShouldContinue = {
  hideContinue?: false;
  shouldContinue: () => Promise<boolean>;
};

type Props = HideContinue | ShouldContinue;

const Controls = (props: Props) => {
  const { t } = useTranslation();
  const context = useContext<FormContextType | null>(FormContext);
  const step = context?.step || 0;

  const onBack = () => {
    context?.setStep(step - 1);
  };

  const onContinue = async () => {
    const canContinue = await (props as ShouldContinue).shouldContinue();
    if (canContinue) {
      context?.setStep(step + 1);
    }
  };

  return (
    <Stack direction="row" justifyContent={'space-between'}>
      <Button size="large" variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
        {step === 0 ? t('spontanei.form.abort') : t('spontanei.form.back')}
      </Button>
      {!props.hideContinue && (
        <Button size="large" variant="contained" onClick={onContinue}>
          {t('spontanei.form.continue')}
        </Button>
      )}
    </Stack>
  );
};
export default Controls;
