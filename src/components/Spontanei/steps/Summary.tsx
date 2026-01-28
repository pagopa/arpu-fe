import React, { useContext } from 'react';
import { Card, Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';

const SummaryStructure = (props: { title: string; children: React.ReactNode }) => (
  <Stack direction="column" padding={3} gap={2}>
    <Typography fontSize={18} fontWeight={600} fontStyle="semibold">
      {props.title}
    </Typography>
    {props.children}
  </Stack>
);

const SummaryItem = (props: { label: string; value: string }) => (
  <Grid container>
    <Grid size={4}>
      <Typography variant='body2'>
        {props.label}
      </Typography>
    </Grid>
    <Grid size={8}>
      <Typography variant='body2' fontWeight={600}>
        {props.value}
      </Typography>
    </Grid>
  </Grid>
);

const OrgAndServiceSummary = () => {
  const { t } = useTranslation();
  const context = useContext<FormContextType | null>(FormContext);
  const orgName = context?.org?.orgName as string;
  const orgCode = context?.org?.orgFiscalCode as string;
  const debtTypeName = context?.debtType?.description as string;
  return (
    <Card sx={{ marginBottom: 2 }} variant="outlined">
      <SummaryStructure title={t('spontanei.form.steps.step4.org.title')}>
        <SummaryItem label={t('spontanei.form.steps.step4.org.name')} value={orgName} />
        <SummaryItem label={t('spontanei.form.steps.step4.org.code')} value={orgCode} />
      </SummaryStructure>
      <SummaryStructure title={t('spontanei.form.steps.step4.service.title')}>
        <SummaryItem label={t('spontanei.form.steps.step4.service.name')} value={debtTypeName} />
      </SummaryStructure>
    </Card>
  );
};

const DebtTypeSummary = () => {
  const { t } = useTranslation();
  const [entityType] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [fullName] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email] = useField<PaymentNoticeInfo['email']>('email');
  const isFisicalPerson = entityType.value === 'F';

  return (
    <Card sx={{ marginBottom: 2 }} variant="outlined">
      <SummaryStructure title={t('Dati del debitore')}>
        <SummaryItem
          label={
            isFisicalPerson
              ? t('spontanei.form.steps.step4.debtor.F.name')
              : t('spontanei.form.steps.step4.debtor.G.name')
          }
          value={fullName.value}
        />
        <SummaryItem
          label={
            isFisicalPerson
              ? t('spontanei.form.steps.step4.debtor.F.code')
              : t('spontanei.form.steps.step4.debtor.G.code')
          }
          value={fiscalCode.value}
        />
        {email.value && (
          <SummaryItem
            label={
              isFisicalPerson
                ? t('spontanei.form.steps.step4.debtor.F.email')
                : t('spontanei.form.steps.step4.debtor.G.email')
            }
            value={email.value}
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

  return (
    <Card sx={{ marginBottom: 2 }} variant="outlined">
      <SummaryStructure title={t("Dati dell'avviso di pagamento")}>
        <SummaryItem label="Oggetto del pagamento" value={description.value} />
        <SummaryItem label="Importo" value={utils.converters.toEuro(amount.value * 100)} />
      </SummaryStructure>
    </Card>
  );
};

const Summary = () => {
  const { t } = useTranslation();

  return (
    <>
      <Card sx={{ padding: 3 }}>
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
