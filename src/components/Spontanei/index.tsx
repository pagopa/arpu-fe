import React from 'react';
import * as z from 'zod';
import { Box, Stack, Typography } from '@mui/material';

import Steps from './steps';
import FormContext from './FormContext';
import OrgSelect from './steps/OrgSelect';
import DebtTypeSelect from './steps/DebtTypeSelect';
import DebtTypeConfig from './steps/DebtTypeConfig';
import Summary from './steps/Summary';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import {
  DebtPositionTypeOrgsWithSpontaneousDTO,
  FormTypeEnum,
  OrganizationsWithSpontaneousDTO,
  PersonEntityType,
  SpontaneousForm,
  SpontaneousFormStructure
} from '../../../generated/data-contracts';
import Payment from './steps/Payment';
import PaymentNoticeInfoSchema from './SpontaneiSchemas';

export type PaymentNoticeInfo = {
  fullName: string;
  entityType: PersonEntityType;
  email?: string;
  fiscalCode: string;
  amount: number;
  description: string;
  org: OrganizationsWithSpontaneousDTO | null;
  debtType: DebtPositionTypeOrgsWithSpontaneousDTO | null;
};

const Spontanei = () => {
  // Omit the first step in steppers
  const [omitFirstStep, setOmitFirstStep] = React.useState(false);
  // Step state
  const [step, setStep] = React.useState({ current: 0, previous: 0 });
  // causale has join template state
  const [causaleHasJoinTemplate, setCausaleHasJoinTemplate] = React.useState(false);
  // summary fields state
  const [summaryFields, setSummaryFields] = React.useState<
    SpontaneousFormStructure['summaryFields']
  >([]);
  const [submitFields, setSubmitFields] = React.useState<SpontaneousFormStructure['submitFields']>(
    []
  );
  // dictionary state
  const [dictionary, setDictionary] = React.useState<SpontaneousForm['dictionary']>({});
  // form type state
  const [formType, setFormType] = React.useState<FormTypeEnum | null>(null);
  const [amountFieldName, setAmountFieldName] = React.useState<string>('amount');
  const { t } = useTranslation();

  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Set focus to the step container when step changes to inform screen readers
    // and start reading the new component's content
    if (stepContainerRef.current && step.current !== step.previous) {
      stepContainerRef.current.focus();
    }
  }, [step.current]);

  const defaultPaymentNoticeInfo: PaymentNoticeInfo = {
    fullName: '',
    entityType: PersonEntityType.F,
    email: '',
    fiscalCode: '',
    amount: 0,
    description: '',
    org: null,
    debtType: null
  };

  const validate = (values: PaymentNoticeInfo) => {
    const errors: Record<string | number, string> = {};
    const result = PaymentNoticeInfoSchema().safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue: z.ZodIssue) => (errors[issue.path[0]] = issue.message));
    }
    return errors;
  };

  const contextValue = React.useMemo(
    () => ({
      omitFirstStep,
      setOmitFirstStep,
      step,
      setStep,
      causaleHasJoinTemplate,
      setCausaleHasJoinTemplate,
      summaryFields,
      setSummaryFields,
      submitFields,
      setSubmitFields,
      dictionary,
      setDictionary,
      amountFieldName,
      setAmountFieldName,
      formType,
      setFormType
    }),
    [
      omitFirstStep,
      step,
      causaleHasJoinTemplate,
      summaryFields,
      submitFields,
      dictionary,
      amountFieldName,
      formType,
      setFormType
    ]
  );

  // Define step translations to announce them
  const stepLabels = [
    t('spontanei.form.steps.step1.step'),
    t('spontanei.form.steps.step2.step'),
    t('spontanei.form.steps.step3.step'),
    t('spontanei.form.steps.step4.step'),
    t('spontanei.form.steps.step5.step')
  ];

  const currentStepName = stepLabels[step.current];

  return (
    <>
      <Box width={'100%'} component="main">
        <Formik initialValues={defaultPaymentNoticeInfo} validate={validate} onSubmit={() => {}}>
          <FormContext.Provider value={contextValue}>
            <Stack direction={'column'} justifyContent={'start'}>
              <Stack gap={1}>
                <Typography variant="h4" component="h1" data-testid="spontanei-title">
                  {t('spontanei.form.title')}
                </Typography>
                <Typography data-testid="spontanei-description">
                  {t('spontanei.form.description')}
                </Typography>
              </Stack>
              <Stack spacing={{ xs: 3, sm: 4 }} mt={4}>
                <Steps activeStep={step.current} />

                {/* Dynamically announce step change and shift focus to the content */}
                <Box
                  ref={stepContainerRef}
                  tabIndex={-1}
                  aria-live="polite"
                  aria-label={currentStepName}>
                  {step.current === 0 && <OrgSelect />}
                  {step.current === 1 && <DebtTypeSelect />}
                  {step.current === 2 && <DebtTypeConfig />}
                  {step.current === 3 && <Summary />}
                  {step.current === 4 && <Payment />}
                </Box>
              </Stack>
            </Stack>
          </FormContext.Provider>
        </Formik>
      </Box>
    </>
  );
};

export default Spontanei;
