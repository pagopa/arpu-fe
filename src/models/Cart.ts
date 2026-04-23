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
