import { Grid, Typography } from '@mui/material';
import React from 'react';

export const DataRow = ({ label, value }: { label: string; value: string }) => (
  <Grid container sx={{ py: 1 }}>
    <Grid size={{ xs: 12, md: 3, xl: 2 }}>
      <Typography variant="body2" color="action.active" sx={{ whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Grid>
    <Grid size={{ xs: 12, md: 3 }}>
      <Typography fontSize={16} variant="caption-semibold">
        {value}
      </Typography>
    </Grid>
  </Grid>
);
