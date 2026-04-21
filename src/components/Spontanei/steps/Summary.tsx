import React, { useContext } from 'react';
import { Card, Divider, Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';
import { useField, useFormikContext } from 'formik';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';
import { CustomFormValues, flattenObject } from '../DinamicForm/config';
import getLocalizedDescription from '../GetLocalizedDescription';
import { ResponsiveCard } from 'components/ResponsiveCard';

enum SummaryFields {
  ORG_NAME = 'orgName',
  ORG_CODE = 'orgCode',
  DEBT_TYPE_NAME = 'debtTypeName',
  FULL_NAME = 'fullName',
  FISCAL_CODE = 'fiscalCode',
  EMAIL = 'email',
  AMOUNT = 'amount',
  DESCRIPTION = 'description'
}

interface WithSummaryFieldsProps {
  summaryFields: SummaryFields[];
}

const WithSummaryFieldsOrHidden = (
  WrappedComponent: React.ComponentType<WithSummaryFieldsProps>
) => {
  return (props: WithSummaryFieldsProps) => {
    const context = useContext<FormContextType | null>(FormContext);
    const summaryFieldsFromContext = context?.summaryFields;

    // if the context is empty, we must show the default summary
    if (!summaryFieldsFromContext || summaryFieldsFromContext.length === 0) {
      return <WrappedComponent {...props} summaryFields={props.summaryFields} />;
    }
    // if the context is not empty, we must filter the summary fields based on the context
    const filteredSummaryFields = props.summaryFields.filter((field) =>
      summaryFieldsFromContext?.includes(field)
    );
    if (filteredSummaryFields.length === 0) {
      return null;
    }
    return <WrappedComponent {...props} summaryFields={filteredSummaryFields} />;
  };
};

const SummaryStructure = (props: {
  title: string;
  children: React.ReactNode;
  dataTestId?: string;
}) => (
  <Stack
    direction="column"
    gap={{ xs: 1, sm: 2 }}
    data-testid={props.dataTestId || 'spontanei-step3-summary-structure'}>
    <Typography
      variant="h6"
      component="h3"
      data-testid={`${props.dataTestId || 'spontanei-step3-summary-structure'}-title`}>
      {props.title}
    </Typography>
    <Stack
      gap={{ xs: 0, sm: 2 }}
      divider={<Divider aria-hidden sx={{ display: { xs: 'block', sm: 'none' }, py: '0.1px' }} />}>
      {props.children}
    </Stack>
  </Stack>
);

const SummaryItem = (props: { label: string; value: string; dataTestId?: string }) => (
  <Grid
    container
    data-testid={props.dataTestId || 'spontanei-step3-summary-item'}
    py={{ xs: 1.5, sm: 0 }}>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography
        variant="body2"
        fontSize={14}
        sx={{ overflowWrap: 'anywhere' }}
        data-testid={`${props.dataTestId || 'spontanei-step3-summary-item'}-label`}>
        {props.label}
      </Typography>
    </Grid>
    <Grid size={{ xs: 12, sm: 6, md: 8 }}>
      <Typography
        variant="body2"
        fontWeight={600}
        fontSize={14}
        data-testid={`${props.dataTestId || 'spontanei-step3-summary-item'}-value`}>
        {props.value}
      </Typography>
    </Grid>
  </Grid>
);

const ExtraSummaryFields = (props: { extraSummaryFields: string[] }) => {
  const { t, i18n } = useTranslation();
  const { extraSummaryFields } = props;

  const { values } = useFormikContext<PaymentNoticeInfo & CustomFormValues>();
  const flattenedValues = flattenObject(values);

  const context = useContext<FormContextType | null>(FormContext);
  const amountFieldName = context?.amountFieldName;

  const isAmountField = (field: string) => field === amountFieldName;

  const getValue = (field: string) => {
    if (isAmountField(field)) {
      return utils.converters.toEuro(flattenedValues[field] as number);
    }
    if (field === 'debtType.description') {
      return getLocalizedDescription(
        values.debtType?.descriptionI18n,
        i18n.language,
        flattenedValues[field] as string
      );
    }
    return flattenedValues[field];
  };

  return (
    <ResponsiveCard variant="outlined" data-testid="spontanei-step4-extra-summary">
      <SummaryStructure
        title={t('spontanei.form.steps.step4.extra.title')}
        dataTestId="summary-extra">
        {extraSummaryFields.map((field) => (
          <SummaryItem
            key={field}
            label={t(`spontanei.form.steps.step4.extra.${field}`)}
            value={`${getValue(field)}`}
            dataTestId={`summary-extra-${field}`}
          />
        ))}
      </SummaryStructure>
    </ResponsiveCard>
  );
};

const OrgAndServiceSummary = WithSummaryFieldsOrHidden((props: WithSummaryFieldsProps) => {
  const { t, i18n } = useTranslation();
  const [org] = useField<PaymentNoticeInfo['org']>('org');
  const [debtType] = useField<PaymentNoticeInfo['debtType']>('debtType');
  const summaryFields = props.summaryFields;

  const orgName = org.value?.orgName || '';
  const orgCode = org.value?.orgFiscalCode || '';
  const debtTypeName = debtType.value
    ? getLocalizedDescription(
      debtType.value.descriptionI18n,
      i18n.language,
      debtType.value.description
    )
    : '';

  return (
    <ResponsiveCard
      sx={{ marginBottom: 2 }}
      variant="outlined"
      data-testid="spontanei-step3-org-and-service-summary">
      {summaryFields?.includes(SummaryFields.ORG_NAME) ||
        summaryFields?.includes(SummaryFields.ORG_CODE) ? (
        <SummaryStructure
          title={t('spontanei.form.steps.step4.org.title')}
          dataTestId="summary-org">
          {summaryFields?.includes(SummaryFields.ORG_NAME) && (
            <SummaryItem
              label={t('spontanei.form.steps.step4.org.name')}
              value={orgName}
              dataTestId="summary-org-name"
            />
          )}
          {summaryFields?.includes(SummaryFields.ORG_CODE) && (
            <SummaryItem
              label={t('spontanei.form.steps.step4.org.code')}
              value={orgCode}
              dataTestId="summary-org-code"
            />
          )}
        </SummaryStructure>
      ) : null}
      {summaryFields?.includes(SummaryFields.DEBT_TYPE_NAME) && (
        <SummaryStructure
          title={t('spontanei.form.steps.step4.service.title')}
          dataTestId="summary-service">
          <SummaryItem
            label={t('spontanei.form.steps.step4.service.name')}
            value={debtTypeName}
            dataTestId="summary-service-name"
          />
        </SummaryStructure>
      )}
    </ResponsiveCard>
  );
});

const DebtTypeSummary = WithSummaryFieldsOrHidden((props: WithSummaryFieldsProps) => {
  const { t } = useTranslation();
  const [entityType] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [fullName] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email] = useField<PaymentNoticeInfo['email']>('email');
  const isFisicalPerson = entityType.value === 'F';
  const summaryFields = props.summaryFields;

  return (
    <ResponsiveCard
      sx={{ marginBottom: 2 }}
      variant="outlined"
      data-testid="spontanei-step3-debtor-summary">
      <SummaryStructure
        title={t('spontanei.form.steps.step4.debtor.title')}
        dataTestId="summary-debtor">
        {summaryFields?.includes(SummaryFields.FULL_NAME) && (
          <SummaryItem
            label={
              isFisicalPerson
                ? t('spontanei.form.steps.step4.debtor.F.name')
                : t('spontanei.form.steps.step4.debtor.G.name')
            }
            value={fullName.value}
            dataTestId="summary-debtor-name"
          />
        )}
        {summaryFields?.includes(SummaryFields.FISCAL_CODE) && (
          <SummaryItem
            label={
              isFisicalPerson
                ? t('spontanei.form.steps.step4.debtor.F.code')
                : t('spontanei.form.steps.step4.debtor.G.code')
            }
            value={fiscalCode.value}
            dataTestId="summary-debtor-code"
          />
        )}
        {email.value && summaryFields?.includes(SummaryFields.EMAIL) && (
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
    </ResponsiveCard>
  );
});

const PaymentSummary = WithSummaryFieldsOrHidden((props: WithSummaryFieldsProps) => {
  const { t, i18n } = useTranslation();
  const [amount] = useField<PaymentNoticeInfo['amount']>('amount');
  const [description] = useField<PaymentNoticeInfo['description']>('description');
  const [debtType] = useField<PaymentNoticeInfo['debtType']>('debtType');
  const context = useContext<FormContextType | null>(FormContext);
  const causaleHasJoinTemplate = context?.causaleHasJoinTemplate;

  const descriptionLabel = causaleHasJoinTemplate
    ? "Pagamento on-the-fly " + getLocalizedDescription(
      debtType.value?.descriptionI18n,
      i18n.language,
      debtType.value?.description || ''
    )
    : description.value;
  const { summaryFields } = props;

  return (
    <ResponsiveCard
      sx={{ marginBottom: 2 }}
      variant="outlined"
      data-testid="spontanei-step3-payment-summary">
      <SummaryStructure
        title={t('spontanei.form.steps.step4.payment.title')}
        dataTestId="summary-payment">
        {summaryFields?.includes(SummaryFields.DESCRIPTION) ? (
          <SummaryItem
            label={t('spontanei.form.steps.step4.payment.description')}
            value={descriptionLabel || ''}
            dataTestId="summary-payment-description"
          />
        ) : null}
        {summaryFields?.includes(SummaryFields.AMOUNT) ? (
          <SummaryItem
            label={t('spontanei.form.steps.step4.payment.amount')}
            value={utils.converters.toEuro(amount.value)}
            dataTestId="summary-payment-amount"
          />
        ) : null}
      </SummaryStructure>
    </ResponsiveCard>
  );
});

const Summary = () => {
  const { t } = useTranslation();

  const context = useContext<FormContextType | null>(FormContext);
  const summaryFieldsFromContext = context?.summaryFields;

  const extraSummaryFields =
    summaryFieldsFromContext?.filter((field) => {
      return (
        field !== SummaryFields.ORG_NAME &&
        field !== SummaryFields.ORG_CODE &&
        field !== SummaryFields.DEBT_TYPE_NAME &&
        field !== SummaryFields.FULL_NAME &&
        field !== SummaryFields.FISCAL_CODE &&
        field !== SummaryFields.EMAIL &&
        field !== SummaryFields.AMOUNT &&
        field !== SummaryFields.DESCRIPTION
      );
    }) || [];

  const hasExtraSummaryFields = extraSummaryFields?.length > 0;

  return (
    <>
      <Card variant="elevation" sx={{ padding: 2 }} data-testid="spontanei-step3-summary">
        <Stack gap={{ xs: 3, sm: 2 }}>
          <Stack gap={{ xs: 0, sm: 1 }}>
            <Typography variant="h5" component="h2">
              {t('spontanei.form.steps.step4.title')}
            </Typography>
            <Typography variant="body2">{t('spontanei.form.steps.step4.description')}</Typography>
          </Stack>
          {hasExtraSummaryFields && <ExtraSummaryFields extraSummaryFields={extraSummaryFields} />}
          <OrgAndServiceSummary
            summaryFields={[
              SummaryFields.ORG_NAME,
              SummaryFields.ORG_CODE,
              SummaryFields.DEBT_TYPE_NAME
            ]}
          />
          <DebtTypeSummary
            summaryFields={[
              SummaryFields.FULL_NAME,
              SummaryFields.FISCAL_CODE,
              SummaryFields.EMAIL
            ]}
          />
          <PaymentSummary summaryFields={[SummaryFields.AMOUNT, SummaryFields.DESCRIPTION]} />
        </Stack>
      </Card>
      <Controls shouldContinue={async () => true} />
    </>
  );
};

export default Summary;
