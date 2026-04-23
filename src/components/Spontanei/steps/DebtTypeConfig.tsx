import React, { useContext, useEffect } from 'react';
import FormContext, { FormContextType } from '../FormContext';
import utils from 'utils';
import StandardForm from '../StandarForm/StandardForm';
import CustomForm from '../DinamicForm/CustomForm';
import ExternalUrlForm from '../ExternalUrlForm/ExternalUrlForm';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '..';
import { FormTypeEnum } from '../../../../generated/data-contracts';

/**
 * This component is responsible for rendering the form based on the debt type.
 * @returns JSX.Element
 */
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

  const summaryFields = data?.formCustom?.structure.summaryFields;
  const submitFields = data?.formCustom?.structure.submitFields;
  const dictionary = data?.formCustom?.dictionary;

  /**
   * Sets the form type in the context.
   */
  useEffect(() => {
    type && context?.setFormType(type);
  }, [type]);

  /**
   * Sets the dictionary in the context.
   */
  useEffect(() => {
    dictionary && context?.setDictionary(dictionary);
  }, [dictionary]);

  /**
   * Sets the summary fields in the context.
   */
  useEffect(() => {
    summaryFields && context?.setSummaryFields(summaryFields);
  }, [summaryFields]);

  /**
   * Sets the submit fields in the context.
   */
  useEffect(() => {
    submitFields && context?.setSubmitFields(submitFields);
    data?.formCustom?.structure.amountFieldName &&
      context?.setAmountFieldName(data?.formCustom?.structure.amountFieldName);
  }, [submitFields, data?.formCustom?.structure.amountFieldName]);

  const hasFlagAnonymousFiscalCode = data?.flagAnonymousFiscalCode;
  const allowedEntityType = data?.allowedEntityType;

  /**
   * Renders the form based on the debt type (memoizing).
   */
  const renderedForm = React.useMemo(() => {
    switch (type) {
      case FormTypeEnum.STANDARD:
        return (
          <StandardForm
            hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode}
            allowedEntityType={allowedEntityType}
          />
        );
      case FormTypeEnum.PRESET_AMOUNT:
        return (
          <StandardForm
            fixedAmount={data?.amountCents}
            hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode}
            allowedEntityType={allowedEntityType}
          />
        );
      case FormTypeEnum.CUSTOM:
        return (
          <CustomForm
            fields={data?.formCustom?.structure.fields || []}
            amountFieldName={data?.formCustom?.structure.amountFieldName}
            allowedEntityType={allowedEntityType}
            hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode}
          />
        );
      case FormTypeEnum.EXTERNAL_URL:
        return <ExternalUrlForm link={data?.externalPaymentUrl || ''} />;
      default:
        return null;
    }
  }, [type, data, hasFlagAnonymousFiscalCode]);

  return renderedForm;
};

export default DebtTypeConfig;
