import { Typography } from '@mui/material';
import React from 'react';

export const DataRow = ({ label, value }: { label: string; value: string }) => (
  <tr>
    <td>
      <Typography variant="body2" color={'action.active'}>
        {label}
      </Typography>
    </td>
    <td>
      <Typography fontSize={16} variant={'caption-semibold'} sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </td>
  </tr>
);
