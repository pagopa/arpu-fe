import { Download } from '@mui/icons-material';
import { Button, IconButton, Stack } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { ArcRoutes } from 'routes/routes';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/apiClient';
import utils from 'utils';

type ActionsProps = {
  installment: InstallmentDebtorExtendedDTO;
};

export const Actions = ({ installment }: ActionsProps) => {
  const navigate = useNavigate();
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();

  const receiptPdf = isAnonymous
    ? utils.loaders.public.usePublicDownloadReceipt({ brokerId })
    : utils.loaders.useDownloadReceipt({ brokerId });

  const onDownload = async () => {
    if (
      installment?.receiptId &&
      installment?.organizationId &&
      installment?.iuv &&
      installment?.debtor?.fiscalCode
    ) {
      try {
        const { blob, filename } = await receiptPdf.mutateAsync({
          receiptId: installment?.receiptId,
          organizationId: installment?.organizationId,
          fiscalCode: installment?.debtor.fiscalCode
        });
        utils.files.downloadBlob(blob, filename || `${installment.iuv}.pdf`);
      } catch {
        utils.notify.emit(t('errors.toast.default'));
      }
    } else {
      utils.notify.emit(t('errors.toast.default'));
    }
  };

  const navigateToDetail = () => {
    if (
      installment?.receiptId &&
      installment?.organizationId &&
      installment?.iuv &&
      installment?.debtor?.fiscalCode
    ) {
      const detailRoute = isAnonymous ? ArcRoutes.public.RECEIPT : ArcRoutes.RECEIPT;
      const path = generatePath(detailRoute, {
        receiptId: installment?.receiptId,
        organizationId: installment.organizationId
      });
      navigate(path, { state: { fiscalCode: installment.debtor.fiscalCode } });
    } else {
      utils.notify.emit(t('errors.toast.default'));
    }
  };

  return (
    <Stack key={installment.installmentId} alignItems="center" direction="row" gap={2}>
      <IconButton aria-label="download" onClick={onDownload}>
        <Download />
      </IconButton>
      <Button size="large" variant="contained" onClick={navigateToDetail}>
        {t('actions.detail')}
      </Button>
    </Stack>
  );
};
