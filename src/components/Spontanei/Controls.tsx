import React, { useContext } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from './FormContext';
import { useNavigate } from 'react-router-dom';

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
  const omitFirstStep = context?.omitFirstStep || false;
  // If the first step is omitted, the back button should navigate to the previous page instead of the first step
  const backButtonWithOmitFirstStep = step === 1 && omitFirstStep;
  const navigate = useNavigate();

  const onBack = () => {
    if (!step || step < 1 || backButtonWithOmitFirstStep) {
      navigate(-1);
    } else {
      context?.setStep(step - 1);
    }
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
        {step === 0 || backButtonWithOmitFirstStep
          ? t('spontanei.form.abort')
          : t('spontanei.form.back')}
      </Button>
      {!props.hideContinue && (
        <Button size="large" variant="contained" onClick={onContinue}>
          {step === 4 ? t('spontanei.form.confirm') : t('spontanei.form.continue')}
        </Button>
      )}
    </Stack>
  );
};
export default Controls;
