import React, { useCallback, useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { generatePath, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { usePostCarts } from 'hooks/usePostCarts';
import { CartItem } from 'models/Cart';
import { OUTCOMES } from '../../../routes/routes';
import storage from 'utils/storage';
import loaders from 'utils/loaders';
import notify from 'utils/notify';
import { useAppRoutes } from 'hooks/useAppRoutes';
import { ROUTES } from 'routes/routes';
import utils from 'utils';

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

  const installmentsMutation = loaders.public.usePublicInstallmentsByIuvOrNav(brokerId!);

  useEffect(() => {
    const fetchInstallment = async () => {
      try {
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
      paTaxCode: orgFiscalCode ?? ''
    };

    postCarts.mutate({ notices: [cartItem] });
  }, [installment, postCarts]);

  const isCancelled = code === OUTCOMES['pagamento-annullato'];

  const downloadUrl = isAnonymous
    ? generatePath(ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD, {
        orgId: installment?.organizationId || -1,
        nav: installment?.nav || ''
      }) + `#debtorFiscalCode=${installment?.debtor?.fiscalCode}`
    : generatePath(ROUTES.PAYMENTS_ON_THE_FLY_DOWNLOAD, {
        orgId: installment?.organizationId || -1,
        nav: installment?.nav || ''
      });

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
        to={downloadUrl}
        target="_blank"
        variant="text"
        startIcon={<Download />}
        data-testid="courtesyPage.downloadCta">
        {t(`courtesyPage.${code}.downloadCta`)}
      </Button>
    </Stack>
  );
};
