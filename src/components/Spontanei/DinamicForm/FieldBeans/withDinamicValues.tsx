import React, { useEffect } from 'react';
import { RenderType, SpontaneousFormField } from '../../../../../generated/data-contracts';
import { buildDinamicValue, computeValue } from '../config';
import { FieldInputProps, useField, useFormikContext } from 'formik';
import { Stack, Tooltip } from '@mui/material';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

type Options = { label: string; value: string }[];

export interface computedPROPS extends SpontaneousFormField, FieldInputProps<any> {
  value: string;
  isHidden?: boolean;
  isDisabled?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  hasJoinTemplate?: boolean;
  joinTemplate?: string;
  allFields?: SpontaneousFormField[];
  options?: Options;
}

const withComputedValues =
  (FieldBean: (props: computedPROPS) => React.JSX.Element) =>
  (props: SpontaneousFormField & { allFields?: SpontaneousFormField[] }) => {
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
      enumerationList = []
    } = props;

    const initialOptions = enumerationList.map((enumeration) => ({
      label: enumeration,
      value: enumeration
    }));

    const [field, meta, helpers] = useField(name);
    const [options, setOptions] = React.useState<Options>(initialOptions);

    const { values } = useFormikContext();

    const isHidden = hiddenDependsOn
      ? computeValue<boolean>(hiddenDependsOn, values)
      : htmlRender === RenderType.NONE;
    const isEnabled = enabledDependsOn ? computeValue<boolean>(enabledDependsOn, values) : false;

    const hasError = meta.touched && Boolean(meta.error);

    const hasValuDependsOn = Boolean(valueDependsOn);

    const erroMessage = errMsg || extraAttr?.error_message || '';
    const helpMessage = helpMsg || extraAttr?.help_message || '';

    useEffect(() => {
      if (hasValuDependsOn && valueDependsOn) {
        const newValue = computeValue(valueDependsOn, values);
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

    React.useEffect(() => {
      const fetchOptions = async () => {
        if (source) {
          try {
            const response = await fetch(source);
            const { data } = await response.json();
            setOptions(data);
          } catch (error) {
            console.error('Error fetching options:', error);
          }
        }
      };
      fetchOptions();
    }, [source]);

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
