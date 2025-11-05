import { SpontaneousFormField } from '../../../../generated/arpu-be/data-contracts';

export type FormServizioDimaico = {
  fieldBeans: SpontaneousFormField[];
  campoTotaleInclusoInXSD?: string;
  setHasError: React.Dispatch<React.SetStateAction<boolean>>;
};
