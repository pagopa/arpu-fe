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
 * - Anonymous flow: points to the PUBLIC courtesy page and appends `nav` +
 *   `org_fiscal_code` as query params, since the public courtesy page rebuilds
 *   the CartItem from scratch via the public installments endpoint.
 * - Authenticated flow: points to the AUTHENTICATED courtesy page with NO query
 *   params, since the cart is already persisted in sessionStorage and the page
 *   reads `cart.items` directly to retry the payment.
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

  if (!isAnonymous) {
    return { OK, KO, CANCEL };
  }

  // Anonymous: append the params needed to rebuild the CartItem on the courtesy page.
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
