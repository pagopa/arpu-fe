import React from 'react';
import { FormControl } from '@mui/material';
import { computedPROPS } from './withDinamicValues';
import { Autocomplete, TextField } from '@mui/material';
import { Option } from './withDinamicValues';
import { useField } from 'formik';
import { normalizeSelectValue } from '../config';

const SELECT = (props: computedPROPS & { multiple?: boolean }) => {
  const { name, onBlur, htmlLabel, hasError, required, errorMessage, options = [] } = props;

  const [fieldValue, , helpers] = useField<Option | null>(name);
  const normalizedValue = normalizeSelectValue(fieldValue.value, options);

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    option: Option | string | null
  ) => {
    if (!option || typeof option === 'string') {
      helpers.setValue(null);
    } else {
      const selectedOption = options?.find((o) => o.value === option?.value) || null;
      helpers.setValue(selectedOption);
    }
  };

  return (
    <FormControl fullWidth error={hasError} required={required}>
      <Autocomplete
        options={options}
        onChange={handleChange}
        onBlur={onBlur}
        freeSolo
        value={normalizedValue}
        getOptionKey={(opt) => (opt as Option).value}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : (option as Option | null)?.label || ''
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={htmlLabel}
            name={name}
            error={hasError}
            helperText={hasError && errorMessage}
          />
        )}
      />
    </FormControl>
  );
};

export default SELECT;
