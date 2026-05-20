import { datetools } from './datetools';
import utils from 'utils';
import { CartItem } from 'models/Cart';
import { ROUTES } from 'routes/routes';
import { generatePath } from 'react-router-dom';

// This high order function is useful to 'decorate' existing function to add
// the functionality to manage undefined (not optional) parameters and output a global character instead
const withMissingValue =
  <P extends unknown[], R>(f: (...args: P) => R, missingValue?: string) =>
  (...args: { [K in keyof P]: P[K] | undefined }) => {
    return [...args].every((arg) => arg !== undefined)
      ? f(...(args as P))
      : missingValue || utils.config.missingValue;
  };

const toEuro = (amount: number, decimalDigits: number = 2, fractionDigits: number = 2): string =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amount / Math.pow(10, decimalDigits));

export const toEuroOrMissingValue = withMissingValue(toEuro);
export const formatDateOrMissingValue = withMissingValue(datetools.formatDate);
export const propertyOrMissingValue = withMissingValue((property: string) => property);

/**
 * Builds the checkout return URLs (OK / KO / CANCEL).
 *
 * Terminology:
 *   - "mono"  = the carts request carries exactly 1 notice (carts.length === 1).
 *               Always true for the anonymous "Paga subito" flow that bypasses
 *               the cart drawer, and also true when the user added a single
 *               item to the cart before paying.
 *   - "pluri" = the carts request carries 2+ notices (carts.length > 1). Only
 *               reachable when the user added multiple items to the cart drawer
 *               before paying.
 *
 * - Authenticated flow (mono or pluri): points to the AUTHENTICATED courtesy
 *   page with NO query params. The cart is already in sessionStorage and the
 *   courtesy page reads `cart.items` directly to retry / show the home link.
 *
 * - Anonymous MONO (carts.length === 1): points to the PUBLIC courtesy page
 *   and appends `nav` + `org_fiscal_code` as query params. These are needed
 *   regardless of whether the item is in sessionStorage or not, because:
 *     1. If the user paid via "Paga subito" the cart is empty, so the public
 *        courtesy page must rebuild the CartItem from the public installments
 *        endpoint using `nav` + `org_fiscal_code`.
 *     2. The "download avviso" PDF URL on KO/CANCEL is built from these params.
 *
 * - Anonymous PLURI (carts.length > 1): points to the PUBLIC courtesy page
 *   with NO query params. Per-notice reconstruction from a single nav is not
 *   feasible, so we rely entirely on `cart.items` from sessionStorage, which
 *   is guaranteed to be populated (the only way to reach pluri is via the
 *   cart drawer). If the session cart is empty on landing (new tab, expired
 *   session, manual URL), the courtesy page falls back to 'sconosciuto'.
 */
const getPaymentOutcomes = (carts: CartItem[], isAnonymous: boolean) => {
  const outcomes = isAnonymous ? ROUTES.public : ROUTES;

  const OK = generatePath(outcomes.COURTESY_PAGE, {
    outcome: 'pagamento-avviso-completato'
  });

  const KO = generatePath(outcomes.COURTESY_PAGE, {
    outcome: 'pagamento-non-riuscito'
  });

  const CANCEL = generatePath(outcomes.COURTESY_PAGE, {
    outcome: 'pagamento-annullato'
  });

  // Auth (mono or pluri) and anonymous pluri: no query params, the cart in
  // sessionStorage carries all the info needed by the courtesy page.
  const skipQueryParams = !isAnonymous || carts.length > 1;
  if (skipQueryParams) {
    return { OK, KO, CANCEL };
  }

  // Anonymous mono: append the params needed to rebuild the CartItem and to
  // build the download-avviso PDF URL on the courtesy page.
  const search = `?nav=${carts[0].nav}&org_fiscal_code=${carts[0].paTaxCode}`;
  return {
    OK: `${OK}${search}`,
    KO: `${KO}${search}`,
    CANCEL: `${CANCEL}${search}`
  };
};

/**
 * cart.allCCP = true only if ALL the items have allCCP true.
 */
const aggregateAllCCP = (cartItems: CartItem[]): boolean =>
  cartItems.length > 0 && cartItems.every((item) => item.allCCP);

const cartItemsToCartsRequest = (cartItems: CartItem[]) => {
  const ORIGIN = window.location.origin;
  const isAnonymous = utils.storage.user.isAnonymous();
  const COURTESY = getPaymentOutcomes(cartItems, isAnonymous);

  return {
    paymentNotices: cartItems.map((item) => ({
      amount: item.amount,
      companyName: item.paFullName,
      description: item.description,
      fiscalCode: item.paTaxCode,
      noticeNumber: item.nav
    })),

    returnUrls: {
      returnOkUrl: `${ORIGIN}${COURTESY.OK}`,
      returnCancelUrl: `${ORIGIN}${COURTESY.CANCEL}`,
      returnErrorUrl: `${ORIGIN}${COURTESY.KO}`
    },
    allCCP: aggregateAllCCP(cartItems)
  };
};

/**
 * Capitalizes the first letter of each word in a string.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeFirstLetter = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function extractFilename(header: string): string | null {
  const filenameMatch = /filename=["']?([^"';]+)["']?/i.exec(header);
  return filenameMatch ? filenameMatch[1].trim() : null;
}

export default {
  cartItemsToCartsRequest,
  toEuro,
  toEuroOrMissingValue,
  formatDateOrMissingValue,
  propertyOrMissingValue,
  withMissingValue,
  capitalizeFirstLetter: withMissingValue(capitalizeFirstLetter),
  extractFilename
};
