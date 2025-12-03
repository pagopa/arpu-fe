export type CartItem = {
  paFullName: string;
  description: string;
  amount: number;
  iuv: string;
  nav: string;
  paTaxCode: string;
};

export type CartState = {
  isOpen: boolean;
  amount: number;
  items: CartItem[];
};
