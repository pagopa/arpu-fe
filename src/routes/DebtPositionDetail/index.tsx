import { Card, Divider, Stack, Typography } from '@mui/material';
import { CopiableRow } from 'components/CopiableRow';
import { PayeeIcon } from 'components/PayeeIcon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import utils from 'utils';
import { fromTaxCodeToSrcImage, propertyOrMissingValue } from 'utils/converters';
import {
  DebtorUnpaidDebtPositionOverviewDTO,
  InstallmentStatus,
  PaymentOptionStatus,
  PaymentOptionType
} from '../../../generated/data-contracts';
import PaymentOptionWrapper from './components/PaymentOptions';

const mockPaymentOptions: DebtorUnpaidDebtPositionOverviewDTO['paymentOptions'] = [
  {
    paymentOptionId: 1,
    paymentOptionType: PaymentOptionType.SINGLE_INSTALLMENT,
    status: PaymentOptionStatus.UNPAID,
    totalAmountCents: 10000,
    installments: [
      {
        installmentId: 3,
        status: InstallmentStatus.UNPAID,
        dueDate: '2024-12-31',
        remittanceInformation: 'Payment for invoice #12345',
        amountCents: 10000
      }
    ]
  },
  {
    paymentOptionId: 2,
    paymentOptionType: PaymentOptionType.INSTALLMENTS,
    status: PaymentOptionStatus.UNPAID,
    totalAmountCents: 10000,
    installments: [
      {
        installmentId: 4,
        status: InstallmentStatus.UNPAID,
        dueDate: '2024-12-31',
        remittanceInformation: 'Payment for invoice #12345',
        amountCents: 10000
      },
      {
        installmentId: 5,
        status: InstallmentStatus.UNPAID,
        dueDate: '2025-01-31',
        remittanceInformation: 'Payment for invoice #12345',
        amountCents: 5000
      },
      {
        installmentId: 6,
        status: InstallmentStatus.UNPAID,
        dueDate: '2025-02-28',
        remittanceInformation: 'Payment for invoice #12345',
        amountCents: 5000
      }
    ]
  }
];

const DebtPositionDetail = () => {
  const brokerId = utils.storage.app.getBrokerId();
  const { t } = useTranslation();
  const { debtPositionId, organizationId } = useParams();

  const { data } = utils.loaders.getDebtPositionDetail(
    brokerId,
    Number(debtPositionId),
    Number(organizationId)
  );

  if (!debtPositionId || isNaN(Number(debtPositionId))) {
    throw new Error('debtPositionId is required and must be a number');
  }

  if (!organizationId || isNaN(Number(organizationId))) {
    throw new Error('organizationId is required and must be a number');
  }

  if (!data) {
    return <div>Loading...</div>; // This should not happen as the loader handles loading state
  }

  return (
    <>
      <Typography variant="h4" component="h1" marginInlineStart={1} mb={2}>
        {data.debtPositionTypeOrgDescription || t('debtPositionDetail.title')}
      </Typography>
      <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {t('app.debtPositionDetail.paymentData')}
        </Typography>
        <Stack direction="row" gap={2}>
          <PayeeIcon src={fromTaxCodeToSrcImage(data.orgFiscalCode)} alt={data.orgName} visible />
          <CopiableRow
            label={t('app.debtPositionDetail.org')}
            value={propertyOrMissingValue(data.orgName)}
          />
        </Stack>
        <Divider />
        <CopiableRow
          label={t('app.debtPositionDetail.cf')}
          value={propertyOrMissingValue(data.orgFiscalCode)}
          copiable
        />
        <Divider />
        <CopiableRow
          label={t('app.debtPositionDetail.iupd')}
          value={propertyOrMissingValue(data.iupd)}
          copiable
        />
      </Card>
      <PaymentOptionWrapper paymentOptions={mockPaymentOptions} />
    </>
  );
};

export default DebtPositionDetail;
