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
import {
  InstallmentDebtorExtendedDTO,
  InstallmentStatus
} from '../../../../generated/data-contracts';
import { usePostCarts } from 'hooks/usePostCarts';
import utils from 'utils';

type ActionsProps = {
  installment: InstallmentDebtorExtendedDTO;
};

export const Actions = ({ installment }: ActionsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();

  const isAnonymous = utils.storage.user.isAnonymous();

  if (!brokerId) {
    throw new Error('Missing required parameters');
  }

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => navigate(ROUTES.public.COURTESY_PAGE.replace(':error', error))
  });

  const receiptPdf = isAnonymous
    ? utils.loaders.public.usePublicDownloadReceipt({ brokerId })
    : utils.loaders.useDownloadReceipt({ brokerId });

  const downloadRoute = isAnonymous
    ? ROUTES.public.DEBT_POSITION_DOWNLOAD
    : ROUTES.DEBT_POSITION_DOWNLOAD;

  const detailRoute = isAnonymous ? ROUTES.public.RECEIPT : ROUTES.RECEIPT;

  const onDownloadPaymentNotice = () => {
    if (installment?.nav && installment?.organizationId && installment?.debtor?.fiscalCode) {
      const path = generatePath(downloadRoute, {
        nav: installment.nav,
        orgId: installment.organizationId
      });

      navigate(`${path}#debtorFiscalCode=${installment.debtor.fiscalCode}`);
    } else {
      utils.notify.emit(t('errors.toast.default'));
    }
  };

  const onDownloadReceipt = () =>
    utils.files.downloadReceipt(receiptPdf.mutateAsync, {
      organizationId: installment.organizationId,
      receiptId: installment.receiptId,
      fiscalCode: installment.debtor?.fiscalCode
    });

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

  const addToCart = () => {
    if (
      !installment?.iuv ||
      !installment?.nav ||
      !installment?.amountCents ||
      !installment?.orgName ||
      !installment?.orgFiscalCode
    ) {
      utils.notify.emit(t('errors.toast.drawer'));
    } else {
      addItem({
        installmentId: installment.installmentId,
        amount: installment.amountCents,
        description: installment.debtPositionTypeOrgDescription,
        iuv: installment.iuv,
        nav: installment.nav,
        paFullName: installment.orgName,
        paTaxCode: installment.orgFiscalCode,
        allCCP: installment.allCCP ?? false
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
        utils.notify.emit(t('errors.toast.payment'));
      } else {
        const cartItem = {
          installmentId: installment.installmentId,
          amount: installment.amountCents,
          description: installment.debtPositionTypeOrgDescription,
          iuv: installment.iuv,
          nav: installment.nav,
          paFullName: installment.orgName,
          paTaxCode: installment.orgFiscalCode,
          allCCP: installment.allCCP ?? false
        };
        carts.mutate({ notices: [cartItem], email: installment?.debtor?.email });
      }
    } catch (e) {
      utils.notify.emit(t('errors.toast.payment'));
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
