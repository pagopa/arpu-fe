import React, { useCallback, useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { CartItem } from 'models/Cart';
import { OUTCOMES } from '../../../routes/routes';
import storage from 'utils/storage';
import loaders from 'utils/loaders';
import { useAppRoutes } from 'hooks/useAppRoutes';
import { useStore } from 'store/GlobalStore';
import appStore from 'store/appStore';
import utils from 'utils';
import {
  useCheckoutRetry,
  useClearCartOnSuccess,
  useEmptyCartGuard,
  useOutcomeFlags
} from '../hooks/useCourtesyPageActions';

interface CourtesyPageActionsProps {
  code: OUTCOMES;
}

/**
 * Dispatcher: routes to the right implementation depending on the user's
 * session state and on the size of the cart in sessionStorage at return time.
 *
 * Note: "mono" vs "pluri" refers to the SIZE OF THE CARTS REQUEST sent to
 * checkout, not to a distinct "single-payment" flow. From the API's perspective
 * every payment goes through `postCarts`. The distinction here is observational:
 *
 *   - Anonymous user pays via "Paga subito" (bypass cart drawer)
 *       -> postCarts gets 1 notice, sessionStorage cart is EMPTY at return.
 *       -> falls in AnonymousSingle (cart.items.length === 0 <= 1).
 *       -> needs the `nav` + `org_fiscal_code` query params to rebuild state.
 *
 *   - Anonymous user adds 1 item to the cart and pays from the drawer
 *       -> postCarts gets 1 notice, sessionStorage cart has 1 item at return.
 *       -> still falls in AnonymousSingle (length === 1 <= 1).
 *       -> still uses the query params (kept for consistency, and for the
 *          "download avviso" PDF URL).
 *
 *   - Anonymous user adds 2+ items to the cart and pays from the drawer
 *       -> postCarts gets 2+ notices, sessionStorage cart has 2+ items at return.
 *       -> falls in AnonymousMulti (length > 1).
 *       -> uses cart.items directly; no query params on the URL.
 *
 *   - Authenticated user (any cart size)
 *       -> falls in Authenticated. The cart is always in sessionStorage; the
 *          page never shows the "download avviso" CTA.
 */
export const CourtesyPageActions: React.FC<CourtesyPageActionsProps> = ({ code }) => {
  const isAnonymous = utils.storage.user.isAnonymous();
  const {
    state: { cart }
  } = useStore();

  if (!isAnonymous) {
    return <AuthenticatedCourtesyActions code={code} />;
  }

  if (cart.items.length > 1) {
    return <AnonymousMultiCourtesyActions code={code} />;
  }

  return <AnonymousSingleCourtesyActions code={code} />;
};

/**
 * Anonymous SINGLE flow.
 *
 * Entered when the cart in sessionStorage has 0 or 1 items at return time.
 * This covers two real-world scenarios:
 *   - "Paga subito" bypass: the user paid directly from the payment step
 *     without ever touching the cart drawer. sessionStorage is empty.
 *   - "Aggiungi al carrello" with a single item: the user added one item to
 *     the drawer, then paid from it. sessionStorage has exactly 1 item.
 *
 * In both cases we DO NOT read the cart from sessionStorage: we rely on the
 * `nav` + `org_fiscal_code` query params on the return URL (appended by
 * `getPaymentOutcomes` in converters.ts), and we fetch the installment list
 * via the public installments endpoint to rebuild the CartItem from scratch.
 *
 * Why this works for both: the public endpoint returns the same installment
 * regardless of whether the user paid from drawer or via "Paga subito", and
 * the params are always present on the URL because `getPaymentOutcomes`
 * appends them whenever the carts request had exactly one notice.
 *
 * Expected query params on the public courtesy-page URL:
 *
 *   ?nav=<noticeNumber>&org_fiscal_code=<orgFiscalCode>&installment_id=<id>
 *
 * From the resolved installment we get `organizationId`, `receiptId` and the
 * debtor's `fiscalCode`. With it the component can:
 *   1. Rebuild the CARTS request and retry the checkout payment (pagamento-non-riuscito)
 *   2. Navigate back to login (pagamento-annullato)
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

const AnonymousSingleCourtesyActions: React.FC<CourtesyPageActionsProps> = ({ code }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { routes } = useAppRoutes();
  const [searchParams] = useSearchParams();

  const nav = searchParams.get('nav');
  const orgFiscalCode = searchParams.get('org_fiscal_code');
  const installmentId = searchParams.get('installment_id');

  const brokerId = storage.app.getBrokerId();

  const [installment, setInstallment] = useState<InstallmentInfo | null>(null);

  const hasRequiredParams = Boolean(nav && orgFiscalCode && brokerId);

  if (!hasRequiredParams) {
    throw new Error('Missing required query params: nav, org_fiscal_code or brokerId');
  }

  const { isOk: isCompleted, isCancelled } = useOutcomeFlags(code);

  const installmentsMutation = loaders.public.usePublicInstallmentsByIuvOrNav(brokerId!);
  const downloadReceiptMutation = loaders.public.usePublicDownloadReceipt({ brokerId: brokerId! });

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
        // On fetch failure we keep `installment` as null: the retry CTA will
        // navigate to the 'sconosciuto' outcome, and the notice-download URL
        // will fall back to the default '-1' org id (see generateDownloadUrl).
        setInstallment(null);
      }
    };

    fetchInstallment();
  }, []);

  const { retry } = useCheckoutRetry();

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

    retry([cartItem]);
  }, [installment, retry]);

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
    isAnonymous: true,
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
          {t(`courtesyPage.${code}.homeCta`)}
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

/**
 * Anonymous MULTI flow.
 *
 * Entered when the cart in sessionStorage has 2+ items at return time. The
 * only way to reach this state is by adding multiple items via the cart
 * drawer ("Aggiungi al carrello" in Payment.tsx) and then paying from the
 * drawer; the "Paga subito" bypass always produces a single-notice request
 * and falls into AnonymousSingle.
 *
 * No query params are needed on the return URL (and none are present, see
 * `getPaymentOutcomes` in converters.ts): retry re-submits `cart.items` as-is.
 *
 * Behaviour by outcome:
 *   - OK (420)    -> only "Torna alla home" (broker homeLink, fallback LOGIN).
 *                    The cart is cleared on landing so it doesn't leak into
 *                    a new spontanei flow.
 *   - KO (424)    -> "Riprova" primary + "Torna alla home" secondary.
 *   - CANCEL(425) -> "Riprova" primary + "Torna alla home" secondary.
 *
 * Edge case: if `cart.items` is empty on a retryable outcome (new tab,
 * expired session, direct URL), we redirect to the generic 'sconosciuto'
 * outcome. In normal usage this branch is unreachable with an empty cart
 * because the dispatcher would have routed to AnonymousSingle instead;
 * the guard exists as defensive programming for unexpected re-renders.
 */
const AnonymousMultiCourtesyActions: React.FC<CourtesyPageActionsProps> = ({ code }) => {
  const { t } = useTranslation();
  const { routes } = useAppRoutes();
  const {
    state: { cart }
  } = useStore();

  const homeHref = appStore.value.brokerInfo?.config?.homeLink || routes.LOGIN;

  const { isOk, isRetryableOutcome } = useOutcomeFlags(code);

  useClearCartOnSuccess(isOk);
  useEmptyCartGuard(isRetryableOutcome, routes.public.COURTESY_PAGE);

  const { postCarts, retry } = useCheckoutRetry();

  const handleRetry = useCallback(() => {
    if (cart.items.length === 0) return;
    retry(cart.items, cart.email);
  }, [cart.items, cart.email, retry]);

  return (
    <Stack gap={2} alignItems="center">
      {isRetryableOutcome && (
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleRetry}
          disabled={postCarts.isPending}
          data-testid="courtesyPage.cta">
          {t(`courtesyPage.${code}.cta`)}
        </Button>
      )}

      <Button
        component="a"
        href={homeHref}
        variant={isRetryableOutcome ? 'text' : 'contained'}
        size="large"
        color="primary"
        data-testid="courtesyPage.homeCta">
        {t(`courtesyPage.${code}.homeCta`, {
          defaultValue: t('courtesyPage.default.homeCta')
        })}
      </Button>
    </Stack>
  );
};

/**
 * Authenticated flow.
 *
 * Entered for any authenticated user, regardless of how many items are in
 * the cart (single or multiple - the API and the UI behave identically).
 * The cart is always in sessionStorage by the time we land here, populated
 * by CartDrawer or Payment.tsx before the checkout redirect.
 *
 * We don't need any query params on the return URL: retry re-submits
 * `cart.items` directly.
 *
 * The cart is kept intact across multiple retries; we don't clear it here.
 * It survives until: a successful payment closes the session (we reset on OK),
 * or the user manually empties it.
 *
 * Edge case: if the user lands here with an empty cart on a retryable
 * outcome (new tab, expired session, direct URL access), there's nothing
 * to retry - we redirect to the generic 'sconosciuto' outcome.
 */
const AuthenticatedCourtesyActions: React.FC<CourtesyPageActionsProps> = ({ code }) => {
  const { t } = useTranslation();
  const { routes } = useAppRoutes();
  const {
    state: { cart }
  } = useStore();

  const { isOk, isKo, isRetryableOutcome } = useOutcomeFlags(code);

  useClearCartOnSuccess(isOk);
  useEmptyCartGuard(isRetryableOutcome, routes.COURTESY_PAGE);

  const { postCarts, retry } = useCheckoutRetry();

  const handleRetry = useCallback(() => {
    if (cart.items.length === 0) return;
    retry(cart.items, cart.email);
  }, [cart.items, cart.email, retry]);

  return (
    <Stack gap={2} alignItems="center">
      {isKo && (
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleRetry}
          disabled={postCarts.isPending}
          data-testid="courtesyPage.cta">
          {t(`courtesyPage.${code}.cta`)}
        </Button>
      )}

      <Button
        component="a"
        href={routes.DASHBOARD}
        variant={isKo ? 'text' : 'contained'}
        size="large"
        color="primary"
        data-testid="courtesyPage.homeCta">
        {t(isOk ? `courtesyPage.${code}.auth.homeCta` : `courtesyPage.${code}.homeCta`, {
          defaultValue: t('courtesyPage.default.homeCta')
        })}
      </Button>
    </Stack>
  );
};
