import React from 'react';
import { Paper, Typography, Stack, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Icon } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface RetryProps {
  action: () => void;
}

export const Retry = (props: RetryProps) => {
  const { t } = useTranslation();
  const { action } = props;
  return (
    <Paper sx={{ padding: 4 }}>
      <Stack alignItems="center" spacing={2} data-testid="app.transactions.error" id="data-error">
        <Icon color="error" component={ErrorOutlineIcon} />
        <Typography variant="body2">{t('app.retry.title')}</Typography>
        <Button onClick={action}>{t('app.retry.action')}</Button>
      </Stack>
    </Paper>
  );
};
