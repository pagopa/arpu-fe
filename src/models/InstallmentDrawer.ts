import { DebtorInstallmentsOverviewDTO } from '../../generated/data-contracts';

export type InstallmentDrawerItem = DebtorInstallmentsOverviewDTO & {
  rateIndex: number;
};

export type InstallmentsDrawerState = {
  isOpen: boolean;
  items: InstallmentDrawerItem[];
};
