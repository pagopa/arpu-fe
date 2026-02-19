import { createContext } from 'react';
import { FormTypeEnum } from '../../../generated/data-contracts';

export type FormContextType = {
  omitFirstStep: boolean;
  setOmitFirstStep: React.Dispatch<React.SetStateAction<boolean>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  formType: FormTypeEnum | null;
  setFormType: React.Dispatch<React.SetStateAction<FormTypeEnum | null>>;
  userDescription: string | null;
  setUserDescription: React.Dispatch<React.SetStateAction<string | null>>;
};

const FormContext = createContext<FormContextType | null>(null);
FormContext.displayName = 'SpontaneousDebtTypesFormContext';

export default FormContext;
