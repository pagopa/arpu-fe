import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { ArcRoutes } from 'routes/routes';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Download from '@mui/icons-material/Download';
import { addItem } from 'store/CartStore';
import loaders from 'utils/loaders';
import files from 'utils/files';
import notify from 'utils/notify';
import {
  InstallmentDebtorExtendedDTO,
  InstallmentStatus
} from '../../../../generated/data-contracts';

type ActionsProps = {
  installment: InstallmentDebtorExtendedDTO;
};

export const Actions = ({ installment }: ActionsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();

  const isAnonymous = utils.storage.user.isAnonymous();

  const receiptPdf = isAnonymous
    ? loaders.public.usePublicDownloadReceipt({ brokerId })
    : loaders.useDownloadReceipt({ brokerId });

  const downloadRoute = isAnonymous
    ? ArcRoutes.public.DEBT_POSITION_DOWNLOAD
    : ArcRoutes.DEBT_POSITION_DOWNLOAD;

  const detailRoute = isAnonymous ? ArcRoutes.public.RECEIPT : ArcRoutes.RECEIPT;

  const onDownloadPaymentNotice = () => {
    if (installment?.iuv && installment?.organizationId && installment?.debtor?.fiscalCode) {
      const path = generatePath(downloadRoute, {
        iuv: installment.iuv,
        organizationId: installment.organizationId
      });

      navigate(path, { state: { fiscalCode: installment.debtor.fiscalCode } });
    } else {
      utils.notify.emit(t('errors.toast.default'));
    }
  };

  const onDownloadReceipt = async () => {
    try {
      if (
        installment?.receiptId &&
        installment?.organizationId &&
        installment?.debtor?.fiscalCode
      ) {
        const { blob, filename } = await receiptPdf.mutateAsync({
          organizationId: installment.organizationId,
          receiptId: installment.receiptId,
          fiscalCode: installment.debtor.fiscalCode
        });
        files.downloadBlob(blob, filename || `${installment?.receiptId}.pdf`);
      }
      throw new Error('Missing required parameters');
    } catch {
      notify.emit(t('app.receiptDetail.downloadError'));
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

  const PaidActions = () => (
    <Stack key={installment.installmentId} alignItems="center" direction="row" gap={2}>
      <IconButton aria-label="download" onClick={onDownloadReceipt}>
        <Download />
      </IconButton>
      <Button size="large" variant="contained" onClick={navigateToDetail}>
        {t('actions.detail')}
      </Button>
    </Stack>
  );

  const ExpiredActions = () => (
    <Button
      startIcon={<Download />}
      key={installment.installmentId}
      aria-label="download"
      size="large"
      variant="contained"
      onClick={onDownloadPaymentNotice}>
      {t('app.debtPositionsSearch.actions.download')}
    </Button>
  );

  const UnpaidActions = () => (
    <Stack
      key={installment.installmentId}
      alignItems="center"
      direction="row"
      gap={0.5}
      justifyContent="space-between"
      width="30%">
      <IconButton aria-label="download" onClick={onDownloadPaymentNotice}>
        <Download />
      </IconButton>
      <IconButton
        aria-label="download"
        onClick={() =>
          addItem({
            installmentId: installment.installmentId,
            amount: installment.amountCents,
            description: installment.debtPositionTypeOrgDescription,
            iuv: installment?.iuv || '',
            nav: installment?.nav || '',
            paFullName: installment.orgName || '',
            paTaxCode: installment.orgFiscalCode || ''
          })
        }>
        <ShoppingCart />
      </IconButton>
      <Button size="large" variant="contained" onClick={navigateToDetail}>
        {t('actions.payNow')}
      </Button>
    </Stack>
  );

  switch (installment.status) {
    case InstallmentStatus.PAID:
    case InstallmentStatus.REPORTED:
      return <PaidActions />;
    case InstallmentStatus.EXPIRED:
      return <ExpiredActions />;
    case InstallmentStatus.UNPAID:
      return <UnpaidActions />;
    default:
      return null;
  }
};
