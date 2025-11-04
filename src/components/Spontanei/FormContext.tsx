import { createContext } from 'react';
import {
  DebtPositionTypeOrgsWithSpontaneousDTO,
  OrganizationsWithSpontaneousDTO
} from '../../../generated/arpu-be/data-contracts';
import { PaymentNoticeInfo } from './Form';

export type FormContextType = {
  org: OrganizationsWithSpontaneousDTO | null;
  setOrg: React.Dispatch<React.SetStateAction<OrganizationsWithSpontaneousDTO | null>>;
  debtType: DebtPositionTypeOrgsWithSpontaneousDTO | null;
  setDebtType: React.Dispatch<React.SetStateAction<DebtPositionTypeOrgsWithSpontaneousDTO | null>>;
  paymentNoticeInfo: PaymentNoticeInfo | null;
  setPaymentNoticeInfo: React.Dispatch<React.SetStateAction<PaymentNoticeInfo | null>>;
};

const FormContext = createContext<FormContextType | null>(null);
FormContext.displayName = 'SpontaneousDebtTypesFormContext';

export default FormContext;
