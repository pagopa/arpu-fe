import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  DebtorPaymentOptionOverviewDTO,
  DebtorReceiptDTO
} from '../../../../generated/data-contracts';
import Typography from '@mui/material/Typography';
import loaders from 'utils/loaders';
import { useParams } from 'react-router-dom';
import storage from 'utils/storage';
import { formatDateOrMissingValue, toEuroOrMissingValue } from 'utils/converters';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Download } from '@mui/icons-material';
import files from 'utils/files';
import notify from 'utils/notify';

type PaidOptionReceiptProps = {
  paymentOption: DebtorPaymentOptionOverviewDTO;
};

export const PaidOptionReceipt = ({ paymentOption }: PaidOptionReceiptProps) => {
  const { t } = useTranslation();
  const brokerId = storage.app.getBrokerId();
  const params = useParams();

  const debtPositionId = Number(params?.debtPositionId);
  const organizationId = Number(params?.organizationId);
  const { data: userInfo } = loaders.getUserInfo();

  const { data } = loaders.getDebtorReceipts(
    brokerId,
    organizationId,
    debtPositionId,
    paymentOption.paymentOptionId
  );

  const downloadReceipt = loaders.useDownloadReceipt({ brokerId });

  const onDownload = async ({ receiptId }: DebtorReceiptDTO) => {
    if (receiptId && userInfo?.fiscalCode) {
      try {
        const { blob, filename } = await downloadReceipt.mutateAsync({
          organizationId,
          receiptId,
          fiscalCode: userInfo.fiscalCode
        });
        files.downloadBlob(blob, filename || `${receiptId}.pdf`);
      } catch {
        notify.emit(t('app.receiptDetail.downloadError'));
      }
    } else {
      notify.emit(t('app.receiptDetail.downloadError'));
    }
  };

  return data?.map((receipt) => (
    <Stack
      key={receipt.receiptId}
      direction="row"
      alignItems="center"
      justifyContent="space-between">
      <Typography key={receipt.receiptId} variant="body1">
        <Trans
          i18nKey="app.debtPositionDetail.paidOptionReceipt"
          values={{
            date: formatDateOrMissingValue(receipt?.paymentDateTime),
            amount: toEuroOrMissingValue(receipt?.paymentAmountCents)
          }}
        />
      </Typography>
      <Button
        startIcon={<Download />}
        variant="outlined"
        size="large"
        onClick={() => onDownload(receipt)}>
        {t('app.debtPositionDetail.downloadReceipt')}
      </Button>
    </Stack>
  ));
};
