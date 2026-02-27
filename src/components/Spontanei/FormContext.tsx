import { createContext } from 'react';
import { SpontaneousFormStructure } from '../../../generated/data-contracts';

export type FormContextType = {
  omitFirstStep: boolean;
  setOmitFirstStep: React.Dispatch<React.SetStateAction<boolean>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  summaryFields: SpontaneousFormStructure['summaryFields'];
  setSummaryFields: React.Dispatch<React.SetStateAction<SpontaneousFormStructure['summaryFields']>>;
  causaleHasJoinTemplate: boolean;
  setCausaleHasJoinTemplate: React.Dispatch<React.SetStateAction<boolean>>;
};

const FormContext = createContext<FormContextType | null>(null);
FormContext.displayName = 'SpontaneousDebtTypesFormContext';

export default FormContext;
