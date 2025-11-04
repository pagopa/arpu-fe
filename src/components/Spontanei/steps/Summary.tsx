import React, { useContext } from 'react';
import { Card, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';


const SummaryStructure = (props: { title: string ; children: React.ReactNode }) => (
  <Card sx={{ marginBottom: 2 }}>
    <Stack direction="column" padding={3} gap={2}>
      <Typography fontSize={14} fontWeight={700} textTransform="uppercase">
        {props.title}
      </Typography>
      {props.children}
    </Stack>
  </Card>
);

const SummaryItem = (props: { label: string; value: string }) => (
  <Stack direction="column">
    <Typography fontSize={16} fontWeight={400}>
      {props.label}
    </Typography>
    <Typography fontSize={18} fontWeight={600}>
      {props.value}
    </Typography>
  </Stack>
);

const OrgSummary = (props: {orgName: string} ) => {
  const { t } = useTranslation();
  return (
    <SummaryStructure title={t('Ente Beneficiario')}>
      <SummaryItem label="Nome Ente" value={props.orgName} />
    </SummaryStructure>
  );
}

const DebtTypeSummary = (props: {debtTypeName: string} ) => {
  const { t } = useTranslation();
  return (
    <SummaryStructure title={t('Servizio')}>
      <SummaryItem label="Nome Servizio" value={props.debtTypeName} />
    </SummaryStructure>
  );
}

const PaymentSummary = () => {
  const { t } = useTranslation();
  const context = useContext<FormContextType | null>(FormContext);
  const name = context?.paymentNoticeInfo?.name || '';
  const surname = context?.paymentNoticeInfo?.surname || '';
  const fiscalCode = context?.paymentNoticeInfo?.fiscalCode || '';
  const description = context?.paymentNoticeInfo?.description || '';
  const amount = context?.paymentNoticeInfo?.amount || 0;

  return (
    <SummaryStructure title={t('Dati del pagamento')}>
      <SummaryItem label="Nome" value={name} />
      <SummaryItem label="Cognome" value={surname} />
      <SummaryItem label="Codice Fiscale" value={fiscalCode} />
      <SummaryItem label="Oggetto del pagamento" value={description} />
      <SummaryItem label="Importo" value={utils.converters.toEuro(amount)} />
    </SummaryStructure>
  );
}

const Summary = () => {
  const context = useContext<FormContextType | null>(FormContext);
  const orgName = context?.org?.orgName;
  const debtTypeName = context?.debtType?.description;  

  return (
    <Stack direction="column">
      {
        orgName && <OrgSummary orgName={orgName} />
      }
      {
        debtTypeName &&
        <DebtTypeSummary debtTypeName={debtTypeName} />
      }
      {
        <PaymentSummary />
      }
    </Stack>
  );
};

export default Summary;
