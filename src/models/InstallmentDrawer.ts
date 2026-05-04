import { DebtorInstallmentsOverviewDTO } from '../../generated/data-contracts';

export type InstallmentDrawerItem = DebtorInstallmentsOverviewDTO & {
  rateIndex: number;
  paFullName: string;
  paTaxCode: string;
  debtPositionId: number;
  paymentOptionId: number;
};

export type InstallmentsDrawerState = {
  isOpen: boolean;
  items: InstallmentDrawerItem[];
};
