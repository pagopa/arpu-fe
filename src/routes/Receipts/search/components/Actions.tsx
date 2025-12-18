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

  const receiptPdf = utils.loaders.useDownloadReceipt({ brokerId });

  const onDownload = async () => {
    if (!installment?.receiptId || !installment?.organizationId || !installment?.iuv) {
      utils.notify.emit(t('app.receiptDetail.downloadError'));
      return;
    }
    try {
      const { blob, filename } = await receiptPdf.mutateAsync({
        receiptId: installment?.receiptId,
        organizationId: installment?.organizationId
      });
      utils.files.downloadBlob(blob, filename || `${installment.iuv}.pdf`);
    } catch {
      utils.notify.emit(t('app.receiptDetail.downloadError'));
    }
  };

  const navigateToDetail = {
    icon: (
      <Typography color="text.primary">
        <Visibility color="inherit" />
      </Typography>
    ),
    label: t('app.receiptsSearch.actions.toDetail'),
    action: () => {
      const path = generatePath(ArcRoutes.RECEIPT, {
        receiptId: installment?.receiptId,
        organizationId: installment?.organizationId
      });
      navigate(path);
    }
  };

  const downloadReceipt = {
    icon: (
      <Typography color="text.primary">
        <Download color="inherit" />
      </Typography>
    ),
    label: t('app.receiptsSearch.actions.download'),
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
