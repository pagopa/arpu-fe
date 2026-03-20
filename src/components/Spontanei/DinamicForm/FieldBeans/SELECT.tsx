import React from 'react';
import { FormControl } from '@mui/material';
import { computedPROPS } from './withDinamicValues';
import { Autocomplete, TextField } from '@mui/material';
import { Option } from './withDinamicValues';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';

const SELECT = (props: computedPROPS & { multiple?: boolean }) => {
  const { t } = useTranslation();
  const { name, onBlur, htmlLabel, hasError, required, errorMessage, options = [] } = props;

  const [fieldValue, , helpers] = useField<Option | null>(name);

  // Guard: ensure the value is a valid Option object, otherwise treat as null
  const currentValue: Option | null =
    fieldValue.value &&
    typeof fieldValue.value === 'object' &&
    'label' in fieldValue.value &&
    'value' in fieldValue.value
      ? fieldValue.value
      : null;

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
        noOptionsText={t('errors.empty.search')}
        value={currentValue}
        getOptionKey={(opt) => (opt as Option).value}
        getOptionLabel={(org) => (org as Option).label}
        id={name}
        renderInput={(params) => (
          <TextField
            {...params}
            label={htmlLabel}
            name={name}
            id={name}
            error={hasError}
            helperText={hasError && errorMessage}
          />
        )}
      />
    </FormControl>
  );
};

export default SELECT;
