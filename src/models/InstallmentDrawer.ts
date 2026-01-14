import { DebtorInstallmentsOverviewDTO } from '../../generated/data-contracts';

export type InstallmentsDrawerState = {
  isOpen: boolean;
  items: DebtorInstallmentsOverviewDTO[];
};
