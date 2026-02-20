import React from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { computedPROPS } from './withDinamicValues';

const SELECT = (props: computedPROPS & { multiple?: boolean }) => {
  const {
    value,
    name,
    multiple = false,
    onChange,
    onBlur,
    htmlLabel,
    hasError,
    required,
    errorMessage,
    options = []
  } = props;

  return (
    <FormControl fullWidth error={hasError} required={required}>
      {htmlLabel && <InputLabel>{htmlLabel}</InputLabel>}
      <Select
        label={htmlLabel}
        multiple={multiple}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        value={value}>
        {options?.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default SELECT;
