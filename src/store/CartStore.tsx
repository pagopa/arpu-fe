import { CartItem, ExtendedCartItem, CartState, CheckoutNotices } from 'models/Cart';
import { usePersistentSignal } from 'hooks/usePersistentSignal';
import { SessionItems } from 'utils/storage';

const MAXCARTITEMS = 5;
const ITEMID = 'iuv';

const defaultCart: CartState = {
  amount: 0,
  isOpen: false,
  items: [],
  email: undefined
};

export const { state: cartState } = usePersistentSignal<CartState>(SessionItems.CART, {
  storage: sessionStorage,
  initialValue: defaultCart
});

export function setCart(cart: CartState) {
  cartState.value = cart;
}

export function resetCart() {
  cartState.value = defaultCart;
}

export function toggleCartDrawer() {
  cartState.value = { ...cartState.value, isOpen: !cartState.value.isOpen };
}

function setCartAmount(amount: number) {
  cartState.value = { ...cartState.value, amount: amount };
}

function updateAmount(items: ExtendedCartItem[]) {
  const amount = items.reduce(
    (accumulatedAmount, cartItem) => accumulatedAmount + cartItem.amount,
    0
  );
  setCartAmount(amount);
}

export function addItem(cartItem: ExtendedCartItem) {
  // Max cart items check
  if (cartState.value.items.length === MAXCARTITEMS) return;
  // Check for duplicates
  if (cartState.value.items.some((item) => item[ITEMID] === cartItem.iuv)) return;

  const items = [...cartState.value.items, cartItem];
  cartState.value = { ...cartState.value, items };

  updateAmount(items);
}

export function deleteItem(itemId: string) {
  // nothing to do if empty
  if (!cartState.value.items.length) return;

  const items = cartState.value.items.filter((item) => item[ITEMID] !== itemId);
  cartState.value = { ...cartState.value, items };

  updateAmount(items);
}

export function getCartItems() {
  return cartState.value.items;
}

export function getTotalAmout() {
  return cartState.value.amount;
}

export function isItemInCart(itemId: string) {
  return cartState.value.items.some((item) => item[ITEMID] === itemId);
}

export function setCartEmail(email?: string) {
  cartState.value = { ...cartState.value, email };
}

export function getCartEmail() {
  return cartState.value.email;
}

const defaultCheckoutNotices: CheckoutNotices = { notices: [], email: undefined };

/**
 * Notices last sent to checkout. Separate from the visible cart so the direct
 * "Paga subito" / installment flows (which never populate the cart) survive the
 * checkout round-trip and let the authenticated courtesy page retry on KO/CANCEL.
 */
export const { state: checkoutNoticesState } = usePersistentSignal<CheckoutNotices>(
  SessionItems.CHECKOUT_NOTICES,
  {
    storage: sessionStorage,
    initialValue: defaultCheckoutNotices
  }
);

export function setCheckoutNotices(notices: CartItem[], email?: string) {
  checkoutNoticesState.value = { notices, email };
}

export function getCheckoutNotices(): CheckoutNotices {
  return checkoutNoticesState.value;
}

export function clearCheckoutNotices() {
  checkoutNoticesState.value = defaultCheckoutNotices;
}
