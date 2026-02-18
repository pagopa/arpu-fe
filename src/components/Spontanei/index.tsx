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
  PersonEntityType
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
  const [step, setStep] = React.useState(0);
  // form type state
  const [formType, setFormType] = React.useState<FormTypeEnum | null>(null);
  // user description state
  const [userDescription, setUserDescription] = React.useState<string | null>(null);

  const { t } = useTranslation();

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
    const result = PaymentNoticeInfoSchema(t).safeParse(values);
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
      formType,
      setFormType,
      userDescription,
      setUserDescription
    }),
    [omitFirstStep, step, formType, userDescription]
  );

  return (
    <>
      <Box width={'100%'} component="main">
        <Formik initialValues={defaultPaymentNoticeInfo} validate={validate} onSubmit={console.log}>
          <FormContext.Provider value={contextValue}>
            <Stack>
              <Typography variant="h4" component="h1" mb={1} data-testid="spontanei-title">
                {t('spontanei.form.title')}
              </Typography>
              <Typography data-testid="spontanei-description">
                {t('spontanei.form.description')}
              </Typography>
              <Stack spacing={4} mt={4}>
                <Steps activeStep={step} />
                {step === 0 && <OrgSelect />}
                {step === 1 && <DebtTypeSelect />}
                {step === 2 && <DebtTypeConfig />}
                {step === 3 && <Summary />}
                {step === 4 && <Payment />}
              </Stack>
            </Stack>
          </FormContext.Provider>
        </Formik>
      </Box>
    </>
  );
};

export default Spontanei;
