import React, { useEffect } from 'react';
import { RenderType, SpontaneousFormField } from '../../../../../generated/data-contracts';
import {
  buildDinamicValue,
  computeValue,
  CustomFormValues,
  flattenObject,
  getPlaceholders
} from '../config';
import { FieldInputProps, useField, useFormikContext } from 'formik';
import { Stack, Tooltip } from '@mui/material';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { PaymentNoticeInfo } from 'components/Spontanei';

export type Option = { label: string; value: string };

export interface computedPROPS extends SpontaneousFormField, FieldInputProps<CustomFormValues['']> {
  isHidden?: boolean;
  isDisabled?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  hasJoinTemplate?: boolean;
  joinTemplate?: string;
  allFields?: SpontaneousFormField[];
  options?: Option[];
}

const withComputedValues =
  (FieldBean: (props: computedPROPS) => React.JSX.Element) =>
  (
    props: SpontaneousFormField & { allFields?: SpontaneousFormField[]; amountFieldName?: string }
  ) => {
    const {
      hiddenDependsOn,
      enabledDependsOn,
      name,
      htmlRender,
      valueDependsOn,
      errorMessage: errMsg,
      helpMessage: helpMsg,
      extraAttr,
      allFields,
      source,
      sourceParams = [],
      enumerationList = [],
      amountFieldName
    } = props;

    const initialOptions = enumerationList.map((enumeration) => ({
      label: enumeration,
      value: enumeration
    }));

    const [field, meta, helpers] = useField<CustomFormValues['']>(name);
    const [options, setOptions] = React.useState<Option[]>(initialOptions);
    const [, , descriptionHelpers] = useField<PaymentNoticeInfo['description']>('description');
    const [, , amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
    const { values } = useFormikContext<CustomFormValues>();

    const isHidden = hiddenDependsOn
      ? computeValue<boolean>(hiddenDependsOn, values)
      : htmlRender === RenderType.NONE;

    //const isHidden = false;
    const isEnabled = enabledDependsOn
      ? computeValue<boolean>(enabledDependsOn, values)
      : htmlRender === RenderType.CURRENCY_LABEL || htmlRender === RenderType.DYNAMIC_AMOUNT_LABEL;

    const hasError = meta.touched && Boolean(meta.error);

    const hasValuDependsOn = Boolean(valueDependsOn);

    const erroMessage = errMsg || extraAttr?.error_message || '';
    const helpMessage = helpMsg || extraAttr?.help_message || '';

    useEffect(() => {
      if (hasValuDependsOn && valueDependsOn) {
        const newValue = computeValue<string>(valueDependsOn, values);
        helpers.setValue(newValue, false);
      }
    }, [values]);

    const hasJoinTemplate = Boolean(extraAttr?.join_template);
    const joinTemplate = hasJoinTemplate ? extraAttr?.join_template || '' : '';

    const value = hasJoinTemplate
      ? buildDinamicValue(joinTemplate, values, allFields)
      : field.value;

    useEffect(() => {
      if (hasJoinTemplate) helpers.setValue(value);
    }, [value]);

    // the following code is to fetch dynamic values from a source url
    const flattenedValues = flattenObject(values);
    const urlParams = getPlaceholders(source || '');
    const urlParamsValues = urlParams.map((urlParam) => flattenedValues[urlParam]);
    const queryParams = sourceParams;
    const queryParamsValues = queryParams.map((urlParam) => flattenedValues[urlParam]);
    const allDependenciesValues = [...urlParamsValues, ...queryParamsValues];
    React.useEffect(() => {
      const fetchDynamicResult = async () => {
        try {
          if (source) {
            let resultSource = buildDinamicValue(source, flattenedValues);
            const queryString = queryParams.map((param) => `${param}=${values[param]}`).join('&');
            resultSource = `${resultSource}?${queryString}`;
            const response = await fetch(resultSource);
            const { result } = await response.json();
            switch (htmlRender) {
              case RenderType.DYNAMIC_SELECT:
                setOptions(result as Option[]);
                break;
              case RenderType.DYNAMIC_AMOUNT_LABEL:
                helpers.setValue(result as number, false);
                break;
              default:
                break;
            }
          }
        } catch (error) {
          console.error('Error fetching dynamic result:', error);
        }
      };
      /** this is to prevent to call an source url without url placeholders */
      if (urlParamsValues.length > 0 && urlParamsValues.every((value) => !value)) return;
      fetchDynamicResult();
    }, [source, ...allDependenciesValues]);

    // sys_type custom field is used to update the description field
    useEffect(() => {
      // causale update
      if (field.value && name === 'sys_type') {
        if (typeof field.value === 'string') {
          descriptionHelpers.setValue(field.value);
        } else {
          throw new Error(`An errror occurred trying to update the sys_type field: ${field.value}`);
        }
      }
    }, [field.value]);

    // importo update
    useEffect(() => {
      if (field.value && name === amountFieldName) {
        // importo update
        if (typeof field.value === 'number') {
          amountHelpers.setValue(field.value);
        } else if (typeof field.value === 'string') {
          amountHelpers.setValue(parseFloat(field.value));
        } else {
          throw new Error(`An errror occurred trying to update the amount field: ${field.value}`);
        }
      }
    }, [field.value]);

    return (
      <Stack
        direction="row"
        gap={2}
        alignItems="center"
        sx={{ display: isHidden ? 'none' : 'inherit' }}>
        <FieldBean
          {...props}
          {...field}
          isDisabled={!isEnabled}
          hasError={hasError}
          errorMessage={erroMessage}
          hasJoinTemplate={hasJoinTemplate}
          joinTemplate={joinTemplate}
          allFields={allFields}
          options={options}
        />
        {helpMessage && (
          <Tooltip title={helpMessage}>
            <InfoRoundedIcon />
          </Tooltip>
        )}
      </Stack>
    );
  };

export default withComputedValues;
