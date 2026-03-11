import { ROUTES } from 'routes/routes';
import Button from '@mui/material/Button';
import Download from '@mui/icons-material/Download';
import { generatePath, useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import React from 'react';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

import { addItem } from 'store/CartStore';
import files from 'utils/files';
import {
  InstallmentDebtorExtendedDTO,
  InstallmentStatus
} from '../../../../generated/data-contracts';
import loaders from 'utils/loaders';
import notify from 'utils/notify';
import storage from 'utils/storage';
import { usePostCarts } from 'hooks/usePostCarts';

type ActionsProps = {
  installment: InstallmentDebtorExtendedDTO;
};

export const Actions = ({ installment }: ActionsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const brokerId = storage.app.getBrokerId();

  const isAnonymous = storage.user.isAnonymous();

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => navigate(ROUTES.public.COURTESY_PAGE.replace(':error', error))
  });

  const receiptPdf = isAnonymous
    ? loaders.public.usePublicDownloadReceipt({ brokerId })
    : loaders.useDownloadReceipt({ brokerId });

  const downloadRoute = isAnonymous
    ? ROUTES.public.DEBT_POSITION_DOWNLOAD
    : ROUTES.DEBT_POSITION_DOWNLOAD;

  const detailRoute = isAnonymous ? ROUTES.public.RECEIPT : ROUTES.RECEIPT;

  const onDownloadPaymentNotice = () => {
    if (installment?.iuv && installment?.organizationId && installment?.debtor?.fiscalCode) {
      const path = generatePath(downloadRoute, {
        iuv: installment.iuv,
        organizationId: installment.organizationId
      });

      navigate(path, { state: { fiscalCode: installment.debtor.fiscalCode } });
    } else {
      notify.emit(t('errors.toast.default'));
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
      } else {
        throw new Error('Missing required parameters');
      }
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
      notify.emit(t('errors.toast.default'));
    }
  };

  const addToCart = () => {
    if (
      !installment?.iuv ||
      !installment?.nav ||
      !installment?.amountCents ||
      !installment?.orgName ||
      !installment?.orgFiscalCode
    ) {
      notify.emit(t('errors.toast.drawer'));
    } else {
      addItem({
        installmentId: installment.installmentId,
        amount: installment.amountCents,
        description: installment.debtPositionTypeOrgDescription,
        iuv: installment.iuv,
        nav: installment.nav,
        paFullName: installment.orgName,
        paTaxCode: installment.orgFiscalCode
      });
    }
  };

  const goToPayment = () => {
    try {
      if (
        !installment?.iuv ||
        !installment?.nav ||
        !installment?.amountCents ||
        !installment?.orgName ||
        !installment?.orgFiscalCode
      ) {
        notify.emit(t('errors.toast.payment'));
      } else {
        const cartItem = {
          installmentId: installment.installmentId,
          amount: installment.amountCents,
          description: installment.debtPositionTypeOrgDescription,
          iuv: installment.iuv,
          nav: installment.nav,
          paFullName: installment.orgName,
          paTaxCode: installment.orgFiscalCode
        };
        carts.mutate({ notices: [cartItem], email: installment?.debtor?.email });
      }
    } catch (e) {
      notify.emit(t('errors.toast.payment'));
    }
  };

  const PaidActions = () => (
    <Stack key={installment.installmentId} alignItems="center" direction="row" gap={2}>
      <IconButton aria-label={t('actions.download')} onClick={onDownloadReceipt}>
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
      aria-label={t('actions.download')}
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
      <IconButton aria-label={t('actions.download')} onClick={onDownloadPaymentNotice}>
        <Download />
      </IconButton>
      <IconButton aria-label={t('actions.addToCart')} onClick={addToCart}>
        <ShoppingCart />
      </IconButton>
      <Button size="large" variant="contained" onClick={goToPayment}>
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
