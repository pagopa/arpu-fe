import { SpontaneousFormField } from '../../../../generated/arpu-be/data-contracts';

export type FormServizioDimaico = {
  fieldBeans: SpontaneousFormField[];
  campoTotaleInclusoInXSD?: string;
  formikRef?: React.Ref<any>;
};
