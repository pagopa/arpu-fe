import React from 'react';
import { Typography, Paper, Stack } from '@mui/material';

export const NoData = (props: { title: string; text: string; cta?: React.ReactNode }) => {
  const { title, text } = props;
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        margin: '4px',
        padding: 2
      }}>
      <Stack>
        <Typography
          mb={2}
          variant="body2"
          fontWeight={600}
          data-testid="app.paymentNotice.filtered.noData"
          textAlign="center">
          {title}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={400}
          data-testid="app.paymentNotice.filtered.noData"
          textAlign="center">
          {text}
        </Typography>
      </Stack>
      {props.cta}
    </Paper>
  );
};
