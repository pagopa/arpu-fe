import React from 'react';
import { Option } from './withDinamicValues';
import { useField } from 'formik';
import { FormControl, FormHelperText, MenuItem } from '@mui/material';
import { computedPROPS } from './withDinamicValues';
import { Autocomplete } from '@pagopa/mui-italia';

const SELECT = ({
  onBlur,
  name,
  htmlLabel,
  hasError,
  required,
  multiple,
  errorMessage,
  options = []
}: computedPROPS & { multiple?: boolean }) => {
  const [fieldValue, , helpers] = useField<Option | Option[] | undefined>(name);

  return (
    <FormControl required={required} fullWidth>
      <Autocomplete
        id={name}
        required={required}
        label={htmlLabel}
        multiple={multiple}
        noResultsText={errorMessage}
        value={fieldValue.value}
        options={options}
        onChange={helpers.setValue}
        onBlur={onBlur}
        renderOption={(option, index) => (
          <MenuItem key={option.value + index} value={option.value}>
            {option.label}
          </MenuItem>
        )}
      />
      {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default SELECT;
