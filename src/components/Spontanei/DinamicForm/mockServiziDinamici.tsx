import { SpontaneousFormField } from '../../../../generated/data-contracts';

export type FormServizioDimaico = {
  fieldBeans: SpontaneousFormField[];
  campoTotaleInclusoInXSD?: string;
  formikRef?: React.Ref<unknown>;
};
