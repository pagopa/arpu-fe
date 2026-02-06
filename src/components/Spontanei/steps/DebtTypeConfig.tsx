import React, { useContext } from 'react';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';
import StandardForm from '../StandarForm/StandardForm';
import CustomForm from '../DinamicForm/CustomForm';
import ExternalUrlForm from '../ExternalUrlForm/ExternalUrlForm';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '..';

const DebtTypeConfig = () => {
  const context = useContext<FormContextType | null>(FormContext);
  const [org] = useField<PaymentNoticeInfo['org']>('org');
  const [debtType] = useField<PaymentNoticeInfo['debtType']>('debtType');
  const organizationId = org.value?.organizationId;
  const debtPositionTypeOrgId = debtType.value?.debtPositionTypeOrgId;

  const isAnonymous = utils.storage.user.isAnonymous();
  const brokerId = utils.storage.app.getBrokerId();

  if (!organizationId || !debtPositionTypeOrgId || !brokerId) {
    throw new Error(
      'Missing required parameters: organizationId, debtPositionTypeOrgId, or brokerId'
    );
  }

  const { data } = isAnonymous
    ? utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneousDetail(
        brokerId,
        organizationId,
        debtPositionTypeOrgId
      )
    : utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail(
        brokerId,
        organizationId,
        debtPositionTypeOrgId
      );

  const type = data?.formType;
  context?.setFormType(type || null);

  const hasFlagAnonymousFiscalCode = data?.flagAnonymousFiscalCode || false;

  const renderFormByType = () => {
    switch (type) {
      case 'STANDARD':
        return <StandardForm hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode} />;
      case 'PRESET_AMOUNT':
        return (
          <StandardForm
            fixedAmount={data?.amountCents}
            hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode}
          />
        );
      case 'CUSTOM':
        return (
          <CustomForm
            fields={data?.formCustom?.structure.fields || []}
            amountFieldName={data?.formCustom?.structure.amountFieldName}
          />
        );
      case 'EXTERNAL_URL':
        return <ExternalUrlForm link={data?.externalPaymentUrl || ''} />;
      default:
        return null;
    }
  };

  return renderFormByType();
};

export default DebtTypeConfig;
