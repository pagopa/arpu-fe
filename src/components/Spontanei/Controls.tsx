import React, { useContext } from 'react';
import { ArrowBack } from '@mui/icons-material';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from './FormContext';
import { useNavigate } from 'react-router-dom';

export type HideContinue = {
  hideContinue: true;
};

export type ShouldContinue = {
  hideContinue?: false;
  shouldContinue: () => Promise<boolean>;
};

export type ControlsProps = HideContinue | ShouldContinue;

/**
 * Controls component buttons for the spontaneous form.
 * @param props hideContinue: boolean, shouldContinue: () => Promise<boolean>
 * @returns JSX.Element
 */
const Controls = (props: ControlsProps) => {
  const { t } = useTranslation();
  const context = useContext<FormContextType | null>(FormContext);
  const step = context?.step || { current: 0, previous: 0 };
  const omitFirstStep = context?.omitFirstStep || false;
  // If the first step is omitted, the back button should navigate to the previous page instead of the first step
  const backButtonWithOmitFirstStep = step.current === 1 && omitFirstStep;
  const navigate = useNavigate();

  const showBackButton = omitFirstStep ? step.current > 1 : step.current > 0;

  const onBack = () => {
    if (!step || step.current < 1 || backButtonWithOmitFirstStep) {
      navigate(-1);
    } else {
      context?.setStep({ current: step.current - 1, previous: step.current });
    }
  };

  const onContinue = async () => {
    const canContinue = await (props as ShouldContinue).shouldContinue();
    if (canContinue) {
      context?.setStep({ current: step.current + 1, previous: step.current });
    }
  };

  return (
    <Stack
      my={4}
      direction="row"
      justifyContent={showBackButton ? 'space-between' : 'flex-end'}
      data-testid="spontanei-controls-container">
      {showBackButton && (
        <Button
          size="medium"
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBack />}
          data-testid="spontanei-controls-back-button">
          {t('spontanei.form.back')}
        </Button>
      )}
      {!props.hideContinue && (
        <Button
          size="medium"
          variant="contained"
          onClick={onContinue}
          data-testid="spontanei-controls-continue-button">
          {step.current === 4 ? t('spontanei.form.confirm') : t('spontanei.form.continue')}
        </Button>
      )}
    </Stack>
  );
};
export default Controls;
