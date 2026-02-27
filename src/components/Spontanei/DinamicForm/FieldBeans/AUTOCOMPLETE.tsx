import React from 'react';
import { FormControl, FormHelperText, MenuItem } from '@mui/material';
import { Autocomplete } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';

import { computedPROPS } from './withDinamicValues';
import { Option } from './withDinamicValues';

const AUTOCOMPLETE = ({
  onBlur,
  name,
  htmlLabel,
  hasError,
  required,
  multiple,
  errorMessage,
  options = []
}: computedPROPS & { multiple?: boolean }) => {
  const { t } = useTranslation();
  const [fieldValue, , helpers] = useField<Option | Option[] | undefined>(name);

  return (
    <FormControl required={required} fullWidth>
      <Autocomplete
        id={name}
        required={required}
        label={htmlLabel}
        multiple={multiple}
        noResultsText={t('errors.empty.search')}
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

export default AUTOCOMPLETE;
