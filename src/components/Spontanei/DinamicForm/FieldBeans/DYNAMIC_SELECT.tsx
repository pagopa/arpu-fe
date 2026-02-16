import React from 'react';
import FormControl from '@mui/material/FormControl';
import { FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import { FieldBeanPros } from '../config';
import { useField } from 'formik';

type OptionsResp = { label: string; value: string }[];



const DYNAMIC_SELECT = (props: FieldBeanPros & { multiple?: boolean }) => {
  const { input, multiple = false } = props;
  const { name, htmlLabel, required, extraAttr, source } = input;
  const [field, meta] = useField(name);
  const value = field.value;
  const hasError = meta.touched && Boolean(meta.error);
  const [ options, setOptions ] = React.useState<OptionsResp>([]);

  React.useEffect(() => {
    const fetchOptions = async () => {
      if (source) {
        try {
          const response = await fetch(source);
          const { data } = await response.json();
          console.log(data);
          setOptions(data);
        } catch (error) {
          console.error('Error fetching options:', error);
        }
      }
    };
    fetchOptions();
  }, [source]);

  return (
    <FormControl fullWidth error={hasError} required={required}>
      {htmlLabel && <InputLabel>{htmlLabel}</InputLabel>}
      <Select
        multiple={multiple}
        name={name}
        onChange={field.onChange}
        onBlur={field.onBlur}
        label={htmlLabel}
        value={value}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {hasError && <FormHelperText>{extraAttr?.error_message}</FormHelperText>}
    </FormControl>
  );
};

export default DYNAMIC_SELECT;
