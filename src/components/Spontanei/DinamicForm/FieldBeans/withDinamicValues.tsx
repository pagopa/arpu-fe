import React, { useEffect } from 'react';
import { SpontaneousFormField } from '../../../../../generated/data-contracts';
import { computeValue } from '../config';
import { FieldInputProps, useField, useFormikContext } from 'formik';
import { Box, FormControl, FormHelperText, InputLabel, Tooltip } from '@mui/material';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

export interface computedPROPS extends SpontaneousFormField, FieldInputProps<any> {
  isHidden?: boolean;
  isDisabled?: boolean;
  hasError?: boolean;
  value: string;
  errorMessage?: string;
  isEnabled?: boolean;
  hasJoinTemplate?: boolean;
  joinTemplate?: string;
  allFields?: SpontaneousFormField[];
}

const withComputedValues =
  (FieldBean: (props: computedPROPS) => React.JSX.Element) =>
  (props: SpontaneousFormField & { allFields?: SpontaneousFormField[] }) => {
    const {
      hiddenDependsOn,
      enabledDependsOn,
      name,
      valueDependsOn,
      errorMessage: errMsg,
      helpMessage: helpMsg,
      extraAttr,
      htmlLabel,
      required,
      allFields
    } = props;
    const isHidden = hiddenDependsOn ? computeValue<boolean>(hiddenDependsOn, {}) : false;
    const isEnabled = enabledDependsOn ? computeValue<boolean>(enabledDependsOn, {}) : false;
    const [field, meta, helpers] = useField(name);
    const hasError = meta.touched && Boolean(meta.error);

    const hasValuDependsOn = Boolean(valueDependsOn);

    const { values } = useFormikContext();

    const erroMessage = errMsg || extraAttr?.error_message || '';
    const helpMessage = helpMsg || extraAttr?.help_message || '';

    const hasJoinTemplate = Boolean(extraAttr?.join_template);

    const joinTemplate = hasJoinTemplate ? extraAttr?.join_template || '' : '';

    useEffect(() => {
      if (hasValuDependsOn && valueDependsOn) {
        const newValue = computeValue(valueDependsOn, values);
        helpers.setValue(newValue, false);
      }
    }, [values]);

    return (
      <Box sx={{ display: isHidden ? 'none' : 'inherit' }}>
        <FormControl fullWidth error={hasError} required={required}>
          {htmlLabel && <InputLabel>{htmlLabel}</InputLabel>}
          <FieldBean
            {...props}
            {...field}
            isEnabled={isEnabled}
            hasJoinTemplate={hasJoinTemplate}
            joinTemplate={joinTemplate}
            allFields={allFields}
          />
          {hasError && <FormHelperText>{erroMessage}</FormHelperText>}
        </FormControl>
        {helpMessage && (
          <Tooltip title={helpMessage}>
            <InfoRoundedIcon />
          </Tooltip>
        )}
      </Box>
    );
  };

export default withComputedValues;
