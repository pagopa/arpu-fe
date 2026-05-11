import React, { useCallback, useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { usePostCarts } from 'hooks/usePostCarts';
import { CartItem } from 'models/Cart';
import { OUTCOMES } from '../../../routes/routes';
import storage from 'utils/storage';
import loaders from 'utils/loaders';
import notify from 'utils/notify';
import { useAppRoutes } from 'hooks/useAppRoutes';
import utils from 'utils';

/**
 * Expected query params on the courtesy-page URL:
 *
 *   ?nav=<noticeNumber>&org_fiscal_code=<orgFiscalCode>&installment_id=<id>
 *
 * The component uses `nav` + `org_fiscal_code` to fetch the installment list via the
 * public endpoint, then picks the one matching `installment_id`. From the resolved
 * installment we get `organizationId`, `receiptId` and the debtor's `fiscalCode`.
 *
 * With the resolved installment it can:
 *   1. Rebuild the CARTS request and retry the checkout payment (pagamento-non-riuscito)
 *   2. Navigate back to home (pagamento-annullato)
 *   3. Download the payment receipt PDF (pagamento-avviso-completato)
 *   4. Download the payment notice PDF (pagamento-non-riuscito, pagamento-annullato)
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
  allCCP?: boolean;
  receiptId?: number;
  debtor?: {
    fiscalCode?: string;
  };
}

interface CourtesyPageActionsProps {
  code: OUTCOMES;
}

export const CourtesyPageActions: React.FC<CourtesyPageActionsProps> = ({ code }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { routes } = useAppRoutes();
  const [searchParams] = useSearchParams();

  const nav = searchParams.get('nav');
  const orgFiscalCode = searchParams.get('org_fiscal_code');
  const installmentId = searchParams.get('installment_id');

  const brokerId = storage.app.getBrokerId();

  const isAnonymous = utils.storage.user.isAnonymous();

  const [installment, setInstallment] = useState<InstallmentInfo | null>(null);

  const hasRequiredParams = Boolean(nav && orgFiscalCode && brokerId);

  if (!hasRequiredParams) {
    throw new Error('Missing required query params: nav, org_fiscal_code or brokerId');
  }

  const isCompleted = code === OUTCOMES['pagamento-avviso-completato'];
  const isCancelled = code === OUTCOMES['pagamento-annullato'];

  const installmentsMutation = loaders.public.usePublicInstallmentsByIuvOrNav(brokerId!);
  const downloadReceiptMutation = loaders.public.usePublicDownloadReceipt({ brokerId: brokerId! });

  useEffect(() => {
    const fetchInstallment = async () => {
      const data = await installmentsMutation.mutateAsync({
        iuvOrNav: nav!,
        orgFiscalCode: orgFiscalCode!
      });

      const installments = data as InstallmentInfo[];
      const match =
        installments?.length === 1
          ? installments[0]
          : installments.find((i) => i.installmentId === Number(installmentId));

      setInstallment(match ?? null);
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
    if (!installment) {
      navigate(routes.public.COURTESY_PAGE.replace(':outcome', String(OUTCOMES['sconosciuto'])));
      return;
    }

    const cartItem: CartItem = {
      paFullName: installment.orgName ?? '',
      description: installment.remittanceInformation,
      amount: installment.amountCents ?? 0,
      iuv: installment.iuv ?? '',
      nav: installment.nav ?? '',
      paTaxCode: orgFiscalCode ?? '',
      allCCP: installment.allCCP ?? false
    };

    postCarts.mutate({ notices: [cartItem] });
  }, [installment, postCarts]);

  const handleDownloadReceipt = useCallback(() => {
    utils.files.downloadReceipt(downloadReceiptMutation.mutateAsync, {
      organizationId: installment?.organizationId,
      receiptId: installment?.receiptId,
      fiscalCode: installment?.debtor?.fiscalCode
    });
  }, [installment, downloadReceiptMutation]);

  const noticeDownloadUrl = utils.files.generateDownloadUrl({
    orgId: installment?.organizationId,
    nav: installment?.nav,
    isAnonymous,
    fiscalCode: installment?.debtor?.fiscalCode
  });

  if (isCompleted) {
    return (
      <Stack gap={2} alignItems="center">
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleDownloadReceipt}
          disabled={!installment || downloadReceiptMutation.isPending}
          data-testid="courtesyPage.cta">
          {t(`courtesyPage.${code}.cta`)}
        </Button>

        <Button
          component="a"
          href={routes.LOGIN}
          variant="text"
          data-testid="courtesyPage.secondaryCta">
          {t(`courtesyPage.${code}.secondaryCta`)}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack gap={2} alignItems="center">
      {isCancelled ? (
        <Button
          component="a"
          href={routes.LOGIN}
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
        component={Link}
        to={noticeDownloadUrl}
        target="_blank"
        variant="text"
        startIcon={<Download />}
        data-testid="courtesyPage.downloadCta">
        {t(`courtesyPage.${code}.downloadCta`)}
      </Button>
    </Stack>
  );
};
