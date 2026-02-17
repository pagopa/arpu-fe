import React from 'react';
import { MenuItem, Select } from '@mui/material';
import { computedPROPS } from './withDinamicValues';

const SELECT = (props: computedPROPS & { multiple?: boolean }) => {
  const { value, name, multiple = false, enumerationList, onChange, onBlur } = props;

  return (
    <Select multiple={multiple} name={name} onChange={onChange} onBlur={onBlur} value={value}>
      {enumerationList?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SELECT;
