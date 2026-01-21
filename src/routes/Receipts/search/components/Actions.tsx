import { Visibility, Download } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { ArcRoutes } from 'routes/routes';
import { InstallmentDebtorExtendedDTO } from '../../../../../generated/apiClient';
import utils from 'utils';
import ActionMenu from 'components/ActionMenu/ActionMenu';

type ActionMenuProps = {
  installment: InstallmentDebtorExtendedDTO;
};

export const Actions = ({ installment }: ActionMenuProps) => {
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

  const navigateToDetail = {
    icon: (
      <Typography color="text.primary">
        <Visibility color="inherit" />
      </Typography>
    ),
    label: t('actions.toDetail'),
    action: () => {
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
    }
  };

  const downloadReceipt = {
    icon: (
      <Typography color="text.primary">
        <Download color="inherit" />
      </Typography>
    ),
    label: t('actions.download'),
    action: onDownload
  };

  return (
    <ActionMenu
      rowId={installment.installmentId}
      key={installment.installmentId}
      menuItems={[navigateToDetail, downloadReceipt]}
    />
  );
};
