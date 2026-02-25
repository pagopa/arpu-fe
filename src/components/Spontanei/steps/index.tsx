import React, { useContext, useEffect } from 'react';
import { Skeleton, Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from '../FormContext';
import { useIsFetching } from '@tanstack/react-query';

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
  const [stepBaseNumber, setStepBaseNumber] = React.useState(0);
  const [viewSkeleton, setViewSkeleton] = React.useState(true);

  // Check if any of the org select queries are pending
  const isPendingOrgSelect = useIsFetching({
    predicate: (query) =>
      query.queryKey[0] === 'getPublicOrganizationsWithSpontaneous' ||
      query.queryKey[0] === 'getOrganizationsWithSpontaneous'
  });

  useEffect(() => {
    if (context?.omitFirstStep) {
      setSteps(initialSteps.slice(1));
      setStepBaseNumber(1);
    }
  }, [context?.omitFirstStep]);

  useEffect(() => {
    if (isPendingOrgSelect > 0) {
      setTimeout(() => {
        setViewSkeleton(false);
      }, 1000);
    }
  }, [isPendingOrgSelect]);

  return (
    <>
      {viewSkeleton ? (
        <Skeleton variant="rectangular" height={'64px'} sx={{ p: 4 }} animation={'wave'}></Skeleton>
      ) : (
        <Stepper activeStep={props.activeStep - stepBaseNumber} alternativeLabel>
          {steps.map((label) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      )}
    </>
  );
};

export default Steps;
