import React from 'react';
import { useParams } from 'react-router-dom';
import config from 'utils/config';
import { useReceiptDetail } from './hooks/useReceiptDetail';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import { Button, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataRow } from 'components/DataRow';
import { CopiableRow } from 'components/CopiableRow';
import {
  formatDateOrMissingValue,
  propertyOrMissingValue,
  toEuroOrMissingValue
} from 'utils/converters';

export const ReceiptDetail = () => {
  // TODO: retrieve brokerId from context when available
  const brokerId = Number(config.brokerId);
  const { t } = useTranslation();

  const { receiptId, organizationId } = useParams<{ receiptId: string; organizationId: string }>();
  const { data } = useReceiptDetail([brokerId, Number(organizationId), Number(receiptId)]);

  return (
    <Stack gap={3}>
      <Stack justifyContent="space-between" alignItems="center" direction="row">
        <Typography variant="h4" fontWeight={700}>
          {t('app.receiptDetail.title')}
        </Typography>
        <Button variant="contained" size="large">
          {t('app.receiptDetail.download')}
        </Button>
      </Stack>
      <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={700}>
          {data?.debtPositionTypeOrgDescription}
        </Typography>
        <table style={{ width: '50%' }}>
          <tbody>
            <DataRow label={t('amount')} value={toEuroOrMissingValue(data?.paymentAmountCents)} />
            <DataRow
              label={t('remittanceInformation')}
              value={propertyOrMissingValue(data?.remittanceInformation)}
            />
            <DataRow label={t('iuv')} value={propertyOrMissingValue(data?.iuv)} />
            <DataRow label={t('beneficiary')} value={'-'} />
            <DataRow label={t('beneficiaryFiscalCode')} value={'-'} />
            <DataRow label={t('debtor')} value={propertyOrMissingValue(data?.debtor.fullName)} />
            <DataRow
              label={t('debtorFiscalCode')}
              value={propertyOrMissingValue(data?.debtor.fiscalCode)}
            />
          </tbody>
        </table>
      </Card>
      <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {t('app.receiptDetail.paymentInformation')}
        </Typography>
        <CopiableRow
          label={t('app.receiptDetail.psp')}
          value={propertyOrMissingValue(data?.pspCompanyName)}
        />
        <Divider />
        <CopiableRow
          label={t('app.receiptDetail.paymentDate')}
          value={formatDateOrMissingValue(data?.paymentDateTime)}
        />
        <Divider />
        <CopiableRow label={t('app.receiptDetail.authorizationCode')} value="-" copiable />
        <Divider />
        <CopiableRow
          label={t('app.receiptDetail.iur')}
          value={propertyOrMissingValue(data?.iur)}
          copiable
        />
        <Divider />
        <CopiableRow
          label={t('app.receiptDetail.iud')}
          value={propertyOrMissingValue(data?.iud)}
          copiable
        />
      </Card>
    </Stack>
  );
};
