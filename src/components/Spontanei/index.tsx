import React, { useEffect, useRef } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';

import Steps from './steps';
import FormContext from './FormContext';
import OrgSelect from './steps/OrgSelect';
import DebtTypeSelect from './steps/DebtTypeSelect';
import DebtTypeConfig from './steps/DebtTypeConfig';
import Summary from './steps/Summary';

import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { useUserEmail } from 'hooks/useUserEmail';
import { useUserInfo } from 'hooks/useUserInfo';
import { Formik, useFormik } from 'formik';
import {
  DebtPositionTypeOrgsWithSpontaneousDTO,
  OrganizationsWithSpontaneousDTO,
  PersonEntityType
} from '../../../generated/data-contracts';
import Payment from './steps/Payment';
import utils from 'utils';

export type PaymentNoticeInfo = {
  fullName: string;
  entityType: PersonEntityType;
  email?: string;
  fiscalCode: string;
  amount: number;
  description: string;
};

const Spontanei = () => {
  // Step state
  const [step, setStep] = React.useState(1);
  // Step 1: selected organization
  const [org, setOrg] = React.useState<OrganizationsWithSpontaneousDTO | null>(null);
  // Step 2: selected debt type
  const [debtType, setDebtType] = React.useState<DebtPositionTypeOrgsWithSpontaneousDTO | null>(
    null
  );
  const isAnonymous = utils.storage.user.isAnonymous();

  const { t } = useTranslation();

  const formikRef = useRef<ReturnType<typeof useFormik<PaymentNoticeInfo>>>(null);

  const payerEmail = isAnonymous ? '' : useUserEmail() || '';
  const { userInfo } = isAnonymous ? { userInfo: null } : useUserInfo();
  const name = userInfo?.name || '';
  const surname = userInfo?.familyName || '';
  const payerFullName = `${name} ${surname}`;
  const payerFiscalCode = ''; //TO BE FIXED

  const defaultPaymentNoticeInfo: PaymentNoticeInfo = {
    fullName: payerFullName,
    entityType: PersonEntityType.F,
    email: payerEmail,
    fiscalCode: payerFiscalCode,
    amount: 0,
    description: ''
  };

  const PaymentNoticeInfoSchema = z.object({
    description: z.string().min(1, 'Causale troppo corta'),
    amount: z.number().min(1, 'Importo non valido'),
    fullName: z.string().min(1, 'campo obbligatorio'),
    fiscalCode: z
      .string()
      .regex(
        /(^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$)|(^[0-9]{11}$)/,
        'Codice Fiscale o Partita IVA errato'
      ),
    email: z.string().email('Email non valida')
  });

  const validate = (values: PaymentNoticeInfo) => {
    const errors: Partial<PaymentNoticeInfo> = {};
    const result = PaymentNoticeInfoSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => (errors[issue.path[0]] = issue.message));
    }
    return errors;
  };

  useEffect(() => {
    if (step == 1) formikRef.current?.resetForm();
  }, [step]);

  return (
    <Container>
      <Box padding={3} width={'100%'} component="main">
        <Formik initialValues={defaultPaymentNoticeInfo} validate={validate} onSubmit={console.log}>
          <FormContext.Provider value={{ org, setOrg, debtType, setDebtType, step, setStep }}>
            <Stack>
              <Typography variant="h6" mb={1}>
                {step !== 4 ? t('spontanei.form.title') : t('spontanei.form.summaryTitle')}
              </Typography>
              <Typography>
                {step !== 4
                  ? t('spontanei.form.description')
                  : t('spontanei.form.summaryDescription')}
              </Typography>
              <Stack spacing={4} mt={4}>
                <Steps activeStep={step - 1} />
                {step === 1 && <OrgSelect />}
                {step === 2 && <DebtTypeSelect />}
                {step === 3 && <DebtTypeConfig />}
                {step === 4 && <Summary />}
                {step === 5 && <Payment />}
              </Stack>
            </Stack>
          </FormContext.Provider>
        </Formik>
      </Box>
    </Container>
  );
};

export default Spontanei;
