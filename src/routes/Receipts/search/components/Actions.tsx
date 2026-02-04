import { Download } from '@mui/icons-material';
import { Button, IconButton, Stack } from '@mui/material';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { ArcRoutes } from 'routes/routes';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/apiClient';
import utils from 'utils';
import { useTranslation } from 'react-i18next';

type ActionsProps = {
  installment: InstallmentDebtorExtendedDTO;
};

export const Actions = ({ installment }: ActionsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isAnonymous = utils.storage.user.isAnonymous();
  const downloadRoute = isAnonymous
    ? ArcRoutes.public.RECEIPT_DOWNLOAD
    : ArcRoutes.RECEIPT_DOWNLOAD;

  const detailRoute = isAnonymous ? ArcRoutes.public.RECEIPT : ArcRoutes.RECEIPT;

  const onDownload = () => {
    if (installment?.receiptId && installment?.organizationId && installment?.debtor?.fiscalCode) {
      const path = generatePath(downloadRoute, {
        receiptId: installment.receiptId,
        organizationId: installment.organizationId
      });

      navigate(path, { state: { fiscalCode: installment.debtor.fiscalCode } });
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
