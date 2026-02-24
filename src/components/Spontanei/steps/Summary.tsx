import React, { useContext, useEffect } from 'react';
import { Card, Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';

const SummaryStructure = (props: {
  title: string;
  children: React.ReactNode;
  dataTestId?: string;
}) => (
  <Stack
    direction="column"
    padding={3}
    gap={2}
    data-testid={props.dataTestId || 'spontanei-step3-summary-structure'}>
    <Typography
      fontSize={18}
      fontWeight={600}
      fontStyle="semibold"
      data-testid={`${props.dataTestId || 'spontanei-step3-summary-structure'}-title`}>
      {props.title}
    </Typography>
    {props.children}
  </Stack>
);

const SummaryItem = (props: { label: string; value: string; dataTestId?: string }) => (
  <Grid container data-testid={props.dataTestId || 'spontanei-step3-summary-item'}>
    <Grid size={4}>
      <Typography
        variant="body2"
        data-testid={`${props.dataTestId || 'spontanei-step3-summary-item'}-label`}>
        {props.label}
      </Typography>
    </Grid>
    <Grid size={8}>
      <Typography
        variant="body2"
        fontWeight={600}
        data-testid={`${props.dataTestId || 'spontanei-step3-summary-item'}-value`}>
        {props.value}
      </Typography>
    </Grid>
  </Grid>
);

const OrgAndServiceSummary = () => {
  const { t } = useTranslation();
  const [org] = useField<PaymentNoticeInfo['org']>('org');
  const [debtType] = useField<PaymentNoticeInfo['debtType']>('debtType');

  const orgName = org.value?.orgName || '';
  const orgCode = org.value?.orgFiscalCode || '';
  const debtTypeName = debtType.value?.description || '';

  return (
    <Card
      sx={{ marginBottom: 2 }}
      variant="outlined"
      data-testid="spontanei-step3-org-and-service-summary">
      <SummaryStructure title={t('spontanei.form.steps.step4.org.title')} dataTestId="summary-org">
        <SummaryItem
          label={t('spontanei.form.steps.step4.org.name')}
          value={orgName}
          dataTestId="summary-org-name"
        />
        <SummaryItem
          label={t('spontanei.form.steps.step4.org.code')}
          value={orgCode}
          dataTestId="summary-org-code"
        />
      </SummaryStructure>
      <SummaryStructure
        title={t('spontanei.form.steps.step4.service.title')}
        dataTestId="summary-service">
        <SummaryItem
          label={t('spontanei.form.steps.step4.service.name')}
          value={debtTypeName}
          dataTestId="summary-service-name"
        />
      </SummaryStructure>
    </Card>
  );
};

/**
 * This component is responsible for rendering the summary of the debt type.
 * @returns JSX.Element
 */
const DebtTypeSummary = () => {
  const { t } = useTranslation();
  const [entityType] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [fullName] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email] = useField<PaymentNoticeInfo['email']>('email');
  const isFisicalPerson = entityType.value === 'F';

  return (
    <Card sx={{ marginBottom: 2 }} variant="outlined" data-testid="spontanei-step3-debtor-summary">
      <SummaryStructure title={t('Dati del debitore')} dataTestId="summary-debtor">
        <SummaryItem
          label={
            isFisicalPerson
              ? t('spontanei.form.steps.step4.debtor.F.name')
              : t('spontanei.form.steps.step4.debtor.G.name')
          }
          value={fullName.value}
          dataTestId="summary-debtor-name"
        />
        <SummaryItem
          label={
            isFisicalPerson
              ? t('spontanei.form.steps.step4.debtor.F.code')
              : t('spontanei.form.steps.step4.debtor.G.code')
          }
          value={fiscalCode.value}
          dataTestId="summary-debtor-code"
        />
        {email.value && (
          <SummaryItem
            label={
              isFisicalPerson
                ? t('spontanei.form.steps.step4.debtor.F.email')
                : t('spontanei.form.steps.step4.debtor.G.email')
            }
            value={email.value}
            dataTestId="summary-debtor-email"
          />
        )}
      </SummaryStructure>
    </Card>
  );
};

const PaymentSummary = () => {
  const { t } = useTranslation();
  const [amount] = useField<PaymentNoticeInfo['amount']>('amount');
  const [description] = useField<PaymentNoticeInfo['description']>('description');
  const [debtType] = useField<PaymentNoticeInfo['debtType']>('debtType');
  const context = useContext<FormContextType | null>(FormContext);
  const formType = context?.formType;

  const descriptionLabel = `Pagamento on-the-fly ${formType === 'CUSTOM' ? debtType.value?.description : description.value}`;

  useEffect(() => {
    if (formType === 'CUSTOM') {
      context?.setUserDescription(descriptionLabel);
    }
  }, []);

  return (
    <Card sx={{ marginBottom: 2 }} variant="outlined" data-testid="spontanei-step3-payment-summary">
      <SummaryStructure
        title={t('spontanei.form.steps.step4.payment.title')}
        dataTestId="summary-payment">
        <SummaryItem
          label={t('spontanei.form.steps.step4.payment.description')}
          value={descriptionLabel}
          dataTestId="summary-payment-description"
        />
        <SummaryItem
          label={t('spontanei.form.steps.step4.payment.amount')}
          value={utils.converters.toEuro(amount.value)}
          dataTestId="summary-payment-amount"
        />
      </SummaryStructure>
    </Card>
  );
};

const Summary = () => {
  const { t } = useTranslation();

  return (
    <>
      <Card sx={{ padding: 3 }} data-testid="spontanei-step3-summary">
        <Typography variant="h6" mb={2}>
          {t('spontanei.form.steps.step4.title')}
        </Typography>
        <Typography variant="body1" mb={3}>
          {t('spontanei.form.steps.step4.description')}
        </Typography>
        <Stack direction="column">
          <OrgAndServiceSummary />
          <DebtTypeSummary />
          <PaymentSummary />
        </Stack>
      </Card>
      <Controls shouldContinue={async () => true} />
    </>
  );
};

export default Summary;
