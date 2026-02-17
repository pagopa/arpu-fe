import React, { useContext, useEffect } from 'react';
import { Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from '../FormContext';

const Steps = (props: { activeStep: number }) => {
  const context = useContext<FormContextType | null>(FormContext);
  const { t } = useTranslation();
  const initialSteps = [
    t('spontanei.form.steps.step1.step'),
    t('spontanei.form.steps.step2.step'),
    t('spontanei.form.steps.step3.step'),
    t('spontanei.form.steps.step4.step'),
    t('spontanei.form.steps.step5.step')
  ];
  const [steps, setSteps] = React.useState(initialSteps);

  useEffect(() => {
    if (context?.omitFirstStep) {
      setSteps(initialSteps.slice(1));
    }
  }, [context?.omitFirstStep]);

  return (
    <Stepper activeStep={props.activeStep} alternativeLabel>
      {steps.map((label) => {
        return (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export default Steps;
