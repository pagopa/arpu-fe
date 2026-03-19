import React, { useContext, useEffect, useRef } from 'react';
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
import FormContext, { FormContextType } from 'components/Spontanei/FormContext';

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

// Share in-flight requests across field instances so the same dynamic URL is fetched only once.
const pendingDynamicRequests = new Map<string, Promise<{ result: unknown }>>();
// Keep a short-lived resolved cache to absorb immediate remounts/re-renders.
const resolvedDynamicRequests = new Map<string, { result: unknown; timestamp: number }>();
const RESOLVED_DYNAMIC_REQUEST_TTL_MS = 5000;

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
    const context = useContext<FormContextType | null>(FormContext);
    const lastFetchedDynamicUrlRef = useRef<string | null>(null);

    const isHidden = hiddenDependsOn
      ? computeValue<boolean>(hiddenDependsOn, values)
      : htmlRender === RenderType.NONE;

    const isEnabled = enabledDependsOn
      ? computeValue<boolean>(enabledDependsOn, values)
      : htmlRender !== RenderType.DYNAMIC_AMOUNT_LABEL && htmlRender !== RenderType.CURRENCY_LABEL;

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
    const queryParamsValues = queryParams.map(
      (urlParam) => urlParam?.key && flattenedValues[urlParam.key]
    );
    const allDependenciesValues = [...urlParamsValues, ...queryParamsValues];

    React.useEffect(() => {
      const fetchDynamicResult = async () => {
        try {
          if (!source) return;

          const sourceUrl = buildDinamicValue(source, flattenedValues);
          const queryString = queryParams
            .filter((param) => Boolean(param.key))
            .map((param) => param.key && `${param.name}=${flattenedValues[param.key]}`)
            .join('&');
          const resultSource = queryString ? `${sourceUrl}?${queryString}` : sourceUrl;

          // Skip duplicate fetches triggered by the same field instance during the same lifecycle.
          if (lastFetchedDynamicUrlRef.current === resultSource) {
            return;
          }

          lastFetchedDynamicUrlRef.current = resultSource;

          const resolvedRequest = resolvedDynamicRequests.get(resultSource);
          const hasFreshResolvedRequest =
            resolvedRequest &&
            Date.now() - resolvedRequest.timestamp < RESOLVED_DYNAMIC_REQUEST_TTL_MS;

          // In StrictMode the component can remount right after the first request resolves:
          // reuse the cached payload instead of issuing the same GET again.
          if (hasFreshResolvedRequest) {
            const { result } = resolvedRequest;
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
            return;
          }

          if (resolvedRequest) {
            resolvedDynamicRequests.delete(resultSource);
          }

          const pendingRequest =
            pendingDynamicRequests.get(resultSource) ||
            fetch(resultSource)
              .then((response) => response.json())
              .finally(() => pendingDynamicRequests.delete(resultSource));

          pendingDynamicRequests.set(resultSource, pendingRequest);

          const { result } = await pendingRequest;
          resolvedDynamicRequests.set(resultSource, { result, timestamp: Date.now() });
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
        } catch (error) {
          lastFetchedDynamicUrlRef.current = null;
          console.error('Error fetching dynamic result:', error);
        }
      };

      const hasMissingDependencies =
        allDependenciesValues.length > 0 &&
        allDependenciesValues.some(
          (value) => value === undefined || value === null || value === ''
        );

      /** prevent calls until every URL/query dependency has been resolved */
      if (hasMissingDependencies) {
        lastFetchedDynamicUrlRef.current = null;
        return;
      }

      void fetchDynamicResult();
    }, [source, ...allDependenciesValues]);

    // sys_type custom field is used to update the description field
    useEffect(() => {
      // causale update
      if (field.value && name === 'sys_type') {
        if (hasJoinTemplate) {
          context?.setCausaleHasJoinTemplate(true);
        }
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
