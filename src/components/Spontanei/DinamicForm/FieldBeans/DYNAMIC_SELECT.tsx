import React from 'react';
import { MenuItem, Select } from '@mui/material';
import withComputedValues, { computedPROPS } from './withDinamicValues';

type OptionsResp = { label: string; value: string }[];

const DYNAMIC_SELECT = (props: computedPROPS & { multiple?: boolean }) => {
  const { value, name, source, multiple = false, onChange, onBlur } = props;
  const [options, setOptions] = React.useState<OptionsResp>([]);

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
    <Select multiple={multiple} name={name} onChange={onChange} onBlur={onBlur} value={value}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default withComputedValues(DYNAMIC_SELECT);
