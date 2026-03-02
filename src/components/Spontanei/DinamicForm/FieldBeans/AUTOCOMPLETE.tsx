import React, { useMemo } from 'react';
import { FormControl } from '@mui/material';
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
  const [field, , helpers] = useField<Option | Option[] | undefined>(name);

  const inputValue = useMemo(() => {
    return Array.isArray(field.value)
      ? field.value.map((o) => o.label).join(', ')
      : field.value?.label;
  }, [field.value]);

  return (
    <FormControl fullWidth error={hasError} required={required} onBlur={onBlur}>
      <Autocomplete
        error={hasError}
        helperText={hasError ? errorMessage : ''}
        id={name}
        required={required}
        label={htmlLabel}
        multiple={multiple}
        noResultsText={t('errors.empty.search')}
        inputValue={inputValue}
        value={field.value}
        options={options}
        onChange={helpers.setValue}
      />
    </FormControl>
  );
};

export default AUTOCOMPLETE;
