import React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';

import Steps from './steps';
import FormContext from './FormContext';
import OrgSelect from './steps/OrgSelect';
import DebtTypeSelect from './steps/DebtTypeSelect';
import DebtTypeConfig from './steps/DebtTypeConfig';
import Summary from './steps/Summary';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { Formik } from 'formik';
import {
  DebtPositionTypeOrgsWithSpontaneousDTO,
  FormTypeEnum,
  OrganizationsWithSpontaneousDTO,
  PersonEntityType
} from '../../../generated/data-contracts';
import Payment from './steps/Payment';

export type PaymentNoticeInfo = {
  fullName: string;
  entityType: PersonEntityType;
  email?: string;
  fiscalCode: string;
  amount: number;
  description: string;
  orgName: string;
  debtTypeCode: string;
};

const Spontanei = () => {
  // Step state
  const [step, setStep] = React.useState(0);
  // Step 1: selected organization
  const [org, setOrg] = React.useState<OrganizationsWithSpontaneousDTO | null>(null);
  // Step 2: selected debt type
  const [debtType, setDebtType] = React.useState<DebtPositionTypeOrgsWithSpontaneousDTO | null>(
    null
  );
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
    orgName: '',
    debtTypeCode: ''
  };

  const PaymentNoticeInfoSchema = z.object({
    orgName: z.string().min(2, t('spontanei.form.errors.orgName')),
    debtTypeCode: z.string().min(2, t('spontanei.form.errors.debtTypeCode')),
    description: z.string().min(2, t('spontanei.form.errors.description')),
    amount: z.number().min(1, t('spontanei.form.errors.amount')),
    fullName: z.string().min(2, t('spontanei.form.errors.fullName')),
    fiscalCode: z
      .string()
      .regex(
        /(^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$)|(^[0-9]{11}$)|ANONIMO/,
        t('spontanei.form.errors.fullName')
      ),
    email: z.string().email(t('spontanei.form.errors.email')).optional().or(z.literal(''))
  });

  const validate = (values: PaymentNoticeInfo) => {
    const errors: Record<string | number, string> = {};
    const result = PaymentNoticeInfoSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => (errors[issue.path[0]] = issue.message));
    }
    return errors;
  };

  return (
    <Container>
      <Box padding={3} width={'100%'} component="main">
        <Formik initialValues={defaultPaymentNoticeInfo} validate={validate} onSubmit={console.log}>
          <FormContext.Provider
            value={{
              org,
              setOrg,
              debtType,
              setDebtType,
              step,
              setStep,
              formType,
              setFormType,
              userDescription,
              setUserDescription
            }}>
            <Stack>
              <Typography variant="h6" mb={1}>
                {t('spontanei.form.title')}
              </Typography>
              <Typography>{t('spontanei.form.description')}</Typography>
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
    </Container>
  );
};

export default Spontanei;
