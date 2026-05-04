import { CartState } from 'models/Cart';
import { InstallmentsDrawerState } from 'models/InstallmentDrawer';
import { UserMemo } from 'models/User';

export interface State {
  [STATE.USER_INFO]: UserMemo | undefined;
  [STATE.CART]: CartState;
  [STATE.INSTALLMENTS_DRAWER]: InstallmentsDrawerState;
  [STATE.PAYMENT_TYPE_DRAWER_VISIBILITY_STATUS]: boolean;
}

export interface StoreContextProps {
  state: State;
  setState: (key: keyof State, value?: unknown) => void;
}

export enum STATE {
  USER_INFO = 'userInfo',
  CART = 'cart',
  INSTALLMENTS_DRAWER = 'installmentsDrawer',
  PAYMENT_TYPE_DRAWER_VISIBILITY_STATUS = 'paymentTypeDrawerVisibilityStatus'
}
