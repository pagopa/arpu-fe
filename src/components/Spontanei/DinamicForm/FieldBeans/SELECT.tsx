import React from 'react';
import { FormControl } from '@mui/material';
import { computedPROPS } from './withDinamicValues';
import { Autocomplete, TextField } from '@mui/material';
import { Option } from './withDinamicValues';
import { useField } from 'formik';

const SELECT = (props: computedPROPS & { multiple?: boolean }) => {
  const {
    name,
    onBlur,
    htmlLabel,
    hasError,
    required,
    errorMessage,
    options = []
  } = props;

  const [fieldValue, _, helpers] = useField<Option | null>(name);

  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    option: Option | string | null
  ) => {
    if (!option || typeof option === 'string') {
      helpers.setValue(null);
    } else {
      const selectedOption =
        options?.find((o) => o.value === option?.value) || null;
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
        value={fieldValue.value}
        getOptionKey={(opt) => (opt as Option).value}
        getOptionLabel={(org) => (org as Option).label}
        renderInput={(params) => (
          <TextField
            {...params}
            label={htmlLabel}
            name={name}
            error={hasError}
            helperText={errorMessage}
          />
        )} />
    </FormControl>
  );
};

export default SELECT;
