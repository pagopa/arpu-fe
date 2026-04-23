import { createContext } from 'react';
import {
  FormTypeEnum,
  SpontaneousForm,
  SpontaneousFormStructure
} from '../../../generated/data-contracts';

export type FormContextType = {
  omitFirstStep: boolean;
  setOmitFirstStep: React.Dispatch<React.SetStateAction<boolean>>;
  step: { current: number; previous: number };
  setStep: React.Dispatch<React.SetStateAction<{ current: number; previous: number }>>;
  summaryFields: SpontaneousFormStructure['summaryFields'];
  setSummaryFields: React.Dispatch<React.SetStateAction<SpontaneousFormStructure['summaryFields']>>;
  submitFields: SpontaneousFormStructure['submitFields'];
  setSubmitFields: React.Dispatch<React.SetStateAction<SpontaneousFormStructure['submitFields']>>;
  dictionary: SpontaneousForm['dictionary'];
  setDictionary: React.Dispatch<React.SetStateAction<SpontaneousForm['dictionary']>>;
  amountFieldName: string;
  setAmountFieldName: React.Dispatch<React.SetStateAction<string>>;
  causaleHasJoinTemplate: boolean;
  setCausaleHasJoinTemplate: React.Dispatch<React.SetStateAction<boolean>>;
  formType: FormTypeEnum | null;
  setFormType: React.Dispatch<React.SetStateAction<FormTypeEnum | null>>;
};

const FormContext = createContext<FormContextType | null>(null);
FormContext.displayName = 'SpontaneousDebtTypesFormContext';

export default FormContext;
