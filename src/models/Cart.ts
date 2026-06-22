export type CartItem = {
  paFullName: string;
  description: string;
  amount: number;
  iuv: string;
  nav: string;
  paTaxCode: string;
  allCCP: boolean;
};

export type ExtendedCartItem = CartItem & {
  installmentId?: number;
  paymentOptionId?: number;
  debtPositionId?: number;
};

export type CartState = {
  isOpen: boolean;
  amount: number;
  items: ExtendedCartItem[];
  email?: string;
};

/**
 * Notices last sent to checkout, persisted so the AUTHENTICATED courtesy page
 * can show the KO/CANCEL outcome and retry even when the visible cart is empty
 * (direct "Paga subito" / installment flows bypass the cart drawer).
 */
export type CheckoutNotices = {
  notices: CartItem[];
  email?: string;
};
