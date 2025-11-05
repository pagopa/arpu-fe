import React, { useEffect, useRef } from 'react';
import { Button, Container, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import Steps from './steps';
import FormContext from './FormContext';
import OrgSelect from './steps/Org';
import DebtTypeSelect from './steps/DebtTypeSelect';
import DebtTypeConfig from './steps/DebtTypeConfig';
import Summary from './steps/Summary';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { useUserEmail } from 'hooks/useUserEmail';
import { useUserInfo } from 'hooks/useUserInfo';
import { Formik, useFormik } from 'formik';
import {
  DebtPositionTypeOrgsWithSpontaneousDTO,
  OrganizationsWithSpontaneousDTO,
  PersonEntityType
} from '../../../generated/arpu-be/data-contracts';

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

  const { t } = useTranslation();
  const navigate = useNavigate();

  const formikRef = useRef<ReturnType<typeof useFormik<PaymentNoticeInfo>>>(null);

  const payerEmail = useUserEmail() || '';
  const { userInfo } = useUserInfo();
  const name = userInfo?.name || '';
  const surname = userInfo?.familyName || '';
  const payerFullName = `${name} ${surname}`;
  const payerFiscalCode = userInfo?.fiscalCode || '';

  const defaultPaymentNoticeInfo: PaymentNoticeInfo = {
    fullName: payerFullName,
    entityType: PersonEntityType.F,
    email: payerEmail,
    fiscalCode: payerFiscalCode,
    amount: 0,
    description: ''
  };

  const paymentSchema = z.object({
    causale: z.string().min(2, 'Causale troppo corta').max(50, 'Causale troppo corta'),
    amount: z.number().min(1, 'Importo non valido'),
    payee: z.string().min(1, 'campo obbligatorio'),
    payeeId: z
      .string()
      .regex(
        /(^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$)|(^[0-9]{11}$)/,
        'Codice Fiscale o Partita IVA errato'
      ),
    payer: z.string().min(1, 'campo obbligatorio'),
    payerId: z
      .string()
      .regex(
        /(^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$)|(^[0-9]{11}$)/,
        'Codice Fiscale o Partita IVA errato'
      ),
    payerEmail: z.string().email('Email non valida')
  });

  const onContinue = () => setStep(step + 1);

  const onBack = () => {
    if (step === 1) return navigate(-1);
    setStep(step - 1);
  };

  useEffect(() => {
    if (step == 1) formikRef.current?.resetForm();
  }, [step]);

  const validate = (values: PaymentNoticeInfo) => {
    const errors = {};
    const result = paymentSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => (errors[issue.path[0]] = issue.message));
    }
    return errors;
  };

  return (
    <Container>
      <Formik
        initialValues={defaultPaymentNoticeInfo}
        onSubmit={console.log}
        validate={validate}
        innerRef={formikRef}>
        <FormContext.Provider value={{ org, setOrg, debtType, setDebtType }}>
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
              {step !== 5 && (
                <Stack direction="row" justifyContent={'space-between'}>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={onBack}
                    startIcon={<ArrowBack />}>
                    {step === 0 ? t('spontanei.form.abort') : t('spontanei.form.back')}
                  </Button>
                  <Button size="large" variant="contained" onClick={onContinue}>
                    {t('spontanei.form.continue')}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Stack>
        </FormContext.Provider>
      </Formik>
    </Container>
  );
};

export default Spontanei;
