import React, { useCallback, useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { usePostCarts } from 'hooks/usePostCarts';
import { CartItem } from 'models/Cart';
import { OUTCOMES, ROUTES } from '../../../routes/routes';
import storage from 'utils/storage';
import loaders from 'utils/loaders';
import files from 'utils/files';
import notify from 'utils/notify';

/**
 * Expected query params on the courtesy-page URL:
 *
 *   ?nav=<noticeNumber>&org_fiscal_code=<orgFiscalCode>&installment_id=<id>
 *
 * The component uses `nav` + `org_fiscal_code` to fetch the installment list via the
 * public endpoint, then picks the one matching `installment_id`.
 * With the resolved installment it can:
 *   1. Rebuild the CARTS request and retry the checkout payment (pagamento-non-riuscito)
 *   2. Navigate back to home (pagamento-annullato)
 *   3. Download the payment notice PDF (both cases)
 */

interface InstallmentInfo {
  installmentId: number;
  iuv?: string;
  nav?: string;
  amountCents?: number;
  remittanceInformation: string;
  orgFiscalCode?: string;
  orgName?: string;
  organizationId?: number;
  debtor?: {
    fiscalCode?: string;
  };
}

interface CourtesyPageActionsProps {
  code: OUTCOMES;
}

export const CourtesyPageActions: React.FC<CourtesyPageActionsProps> = ({ code }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const nav = searchParams.get('nav');
  const orgFiscalCode = searchParams.get('org_fiscal_code');
  const installmentId = searchParams.get('installment_id');

  const brokerId = storage.app.getBrokerId();

  const [installment, setInstallment] = useState<InstallmentInfo | null>(null);

  const hasRequiredParams = Boolean(nav && orgFiscalCode && brokerId);

  const installmentsMutation = loaders.public.usePublicInstallmentsByIuvOrNav(brokerId!);

  useEffect(() => {
    if (!hasRequiredParams) return;

    const fetchInstallment = async () => {
      try {
        const data = await installmentsMutation.mutateAsync({
          iuvOrNav: nav!,
          orgFiscalCode: orgFiscalCode!
        });

        const installments = data as InstallmentInfo[];
        const match = installments.find((i) => i.installmentId === Number(installmentId));

        setInstallment(match ?? null);
      } catch {
        setInstallment(null);
      }
    };

    fetchInstallment();
  }, []);

  const postCarts = usePostCarts({
    onSuccess: (checkoutUrl: string) => {
      window.location.assign(checkoutUrl);
    },
    onError: () => {
      notify.emit(t('errors.toast.payment'));
    }
  });

  const handleRetry = useCallback(() => {
    if (!installment) return;

    const cartItem: CartItem = {
      paFullName: installment.orgName ?? '',
      description: installment.remittanceInformation,
      amount: installment.amountCents ?? 0,
      iuv: installment.iuv ?? '',
      nav: installment.nav ?? '',
      paTaxCode: installment.orgFiscalCode ?? ''
    };

    postCarts.mutate({ notices: [cartItem] });
  }, [installment, postCarts]);

  const downloadMutation = loaders.public.getPublicPaymentNotice(
    brokerId!,
    installment?.organizationId ?? 0,
    { iuv: installment?.iuv },
    installment?.debtor?.fiscalCode ?? ''
  );

  const handleDownload = useCallback(async () => {
    if (!installment?.organizationId || !installment?.iuv || !brokerId) return;

    try {
      const { data, filename } = await downloadMutation.mutateAsync();
      files.downloadBlob(data, filename || `${installment.iuv}.pdf`);
    } catch {
      notify.emit(t('app.receiptDetail.downloadError'));
    }
  }, [installment, brokerId, downloadMutation, t]);

  const isCancelled = code === OUTCOMES['pagamento-annullato'];

  return (
    <Stack gap={2} alignItems="center">
      {isCancelled ? (
        <Button
          component={Link}
          to={ROUTES.DASHBOARD}
          variant="contained"
          size="large"
          color="primary"
          data-testid="courtesyPage.cta">
          {t(`courtesyPage.${code}.cta`)}
        </Button>
      ) : (
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleRetry}
          data-testid="courtesyPage.cta">
          {t(`courtesyPage.${code}.cta`)}
        </Button>
      )}

      <Button
        variant="text"
        onClick={handleDownload}
        startIcon={<Download />}
        data-testid="courtesyPage.downloadCta">
        {t(`courtesyPage.${code}.downloadCta`)}
      </Button>
    </Stack>
  );
};
