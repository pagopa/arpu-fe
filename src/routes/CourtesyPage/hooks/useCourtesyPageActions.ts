import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePostCarts } from 'hooks/usePostCarts';
import { CartItem } from 'models/Cart';
import { OUTCOMES } from '../../../routes/routes';
import notify from 'utils/notify';
import { useStore } from 'store/GlobalStore';
import { resetCart } from 'store/CartStore';

/**
 * Derived boolean flags from a courtesy-page outcome code.
 *
 * Kept in a single hook so every component sees the same source of truth and
 * avoids the historical drift where `isRetryableOutcome` was computed mid-body
 * in one component and at the top in another.
 */
export interface OutcomeFlags {
  isOk: boolean;
  isKo: boolean;
  isCancelled: boolean;
  isRetryableOutcome: boolean;
}

export const useOutcomeFlags = (code: OUTCOMES): OutcomeFlags =>
  useMemo(() => {
    const isOk = code === OUTCOMES['pagamento-avviso-completato'];
    const isKo = code === OUTCOMES['pagamento-non-riuscito'];
    const isCancelled = code === OUTCOMES['pagamento-annullato'];
    return {
      isOk,
      isKo,
      isCancelled,
      isRetryableOutcome: isKo || isCancelled
    };
  }, [code]);

/**
 * Wraps `usePostCarts` with the courtesy-page-standard side effects:
 *   - on success: redirect to the checkout URL returned by the API
 *   - on error:   show the payment-failure toast
 *
 * Returns both the raw mutation (for `isPending` etc.) and a typed `retry`
 * helper that submits a `notices` array plus an optional `email`.
 */
export const useCheckoutRetry = () => {
  const { t } = useTranslation();

  const postCarts = usePostCarts({
    onSuccess: (checkoutUrl: string) => {
      window.location.assign(checkoutUrl);
    },
    onError: () => {
      notify.emit(t('errors.toast.payment'));
    }
  });

  const retry = useCallback(
    (notices: CartItem[], email?: string) => {
      postCarts.mutate({ notices, email: email || undefined });
    },
    [postCarts]
  );

  return { postCarts, retry };
};

/**
 * Clears the cart when the outcome is OK and the cart is not already empty.
 *
 * Guarded with `length > 0` to avoid pointless sessionStorage writes when the
 * user lands here with an already-empty cart.
 */
export const useClearCartOnSuccess = (isOk: boolean) => {
  const {
    state: { cart }
  } = useStore();

  useEffect(() => {
    if (isOk && cart.items.length > 0) {
      resetCart();
    }
  }, [isOk, cart.items.length]);
};

/**
 * Redirects to the generic 'sconosciuto' outcome when a retryable outcome
 * (KO/CANCEL) is reached with an empty cart. Covers new-tab, expired-session
 * and direct-URL access cases where there's nothing to retry.
 *
 * `courtesyPageRoute` must be the `:outcome`-templated route — public or
 * authenticated — appropriate for the caller.
 */
export const useEmptyCartGuard = (isRetryableOutcome: boolean, courtesyPageRoute: string) => {
  const navigate = useNavigate();
  const {
    state: { cart }
  } = useStore();

  useEffect(() => {
    if (isRetryableOutcome && cart.items.length === 0) {
      navigate(courtesyPageRoute.replace(':outcome', String(OUTCOMES['sconosciuto'])));
    }
  }, [isRetryableOutcome, cart.items.length]);
};
