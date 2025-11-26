import React from 'react';
import { useParams } from 'react-router-dom';
import config from 'utils/config';
import { useReceiptDetail } from './hooks/useReceiptDetail';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import { Button, Divider, Theme, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataRow } from 'components/DataRow';
import { CopiableRow } from 'components/CopiableRow';
import { useDownloadReceipt } from './hooks/useDownloadReceipt';
import {
  formatDateOrMissingValue,
  propertyOrMissingValue,
  toEuroOrMissingValue
} from 'utils/converters';
import files from 'utils/files';
import notify from 'utils/notify';

export const ReceiptDetail = () => {
  // TODO: retrieve brokerId from context when available
  const brokerId = Number(config.brokerId);
  const { t } = useTranslation();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const params = useParams<{ receiptId: string; organizationId: string }>();
  const receiptId = Number(params?.receiptId);
  const organizationId = Number(params?.organizationId);

  const { data } = useReceiptDetail([brokerId, organizationId, receiptId]);
  const receiptPdf = useDownloadReceipt([brokerId, organizationId, receiptId]);

  const onDownload = async () => {
    try {
      const { blob, filename } = await receiptPdf.mutateAsync();
      files.downloadBlob(blob, filename || `${data?.iuv}.pdf`);
    } catch {
      notify.emit(t('app.receiptDetail.downloadError'));
    }
  };

  return (
    <Stack gap={3}>
      <Stack justifyContent="space-between" alignItems="center" direction="row">
        <Typography variant="h4" fontWeight={700}>
          {t('app.receiptDetail.title')}
        </Typography>
        <Button variant="contained" size="large" onClick={onDownload}>
          {t('app.receiptDetail.download')}
        </Button>
      </Stack>
      <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={700}>
          {data?.debtPositionTypeOrgDescription}
        </Typography>
        <table style={{ width: mdUp ? '50%' : '100%' }}>
          <tbody>
            <DataRow
              label={t('app.receiptDetail.amount')}
              value={toEuroOrMissingValue(data?.paymentAmountCents)}
            />
            <DataRow
              label={t('app.receiptDetail.remittanceInformation')}
              value={propertyOrMissingValue(data?.remittanceInformation)}
            />
            <DataRow label={t('app.receiptDetail.iuv')} value={propertyOrMissingValue(data?.iuv)} />
            {/* TODO: add beneficiary and beneficiaryFiscalCode when available*/}
            {/* <DataRow label={t('app.receiptDetail.beneficiary')} value={'-'} />*/}
            {/* <DataRow label={t('app.receiptDetail.beneficiaryFiscalCode')} value={'-'} />*/}
            <DataRow
              label={t('app.receiptDetail.debtor')}
              value={propertyOrMissingValue(data?.debtor.fullName)}
            />
            <DataRow
              label={t('app.receiptDetail.debtorFiscalCode')}
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
