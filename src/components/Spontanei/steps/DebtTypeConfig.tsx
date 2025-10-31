
import React, { useContext } from 'react';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';
import { useParams } from 'react-router-dom';
import StandardForm from './StandardForm';
import CustomForm from './CustomForm';

const DebtTypeConfig = () => {
  const context = useContext<FormContextType | null>(FormContext);
  const organizationId = context?.org?.organizationId || 0;
  const debtPositionTypeOrgId = context?.debtType?.debtPositionTypeOrgId || 0;
  const { brokerId = '1' } = useParams();

  const { data } = utils.loaders.getDebtPositionTypeOrgsWithSpontaneousDetail(
    parseInt(brokerId, 10),
    organizationId,
    debtPositionTypeOrgId
  );

  const type = data?.formType;

  const renderFormByType = () => {
    switch (type) {
      case 'STANDARD':
        return <StandardForm />;
      case 'PRESET_AMOUNT':
        return <StandardForm fixedAmount={data?.amountCents} />;
      case 'CUSTOM':
        return (
          <CustomForm
            fields={data?.formCustom?.structure.fields || []}
            amountFieldName={data?.formCustom?.structure.amountFieldName}
          />
        );
      case 'EXTERNAL_URL':
        return 'extrernal url form type not implemented yet';
      default:
        return null;
    }
  };

  return renderFormByType();
};

export default DebtTypeConfig;
