import React from 'react';
import Stack from '@mui/material/Stack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Tooltip, Typography } from '@mui/material';

export const CopiableRow = ({
  label,
  value,
  copiable
}: {
  label: string;
  value: string;
  copiable?: boolean;
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          wordBreak: 'break-word',
          flex: 1,
          color: copiable ? 'primary.main' : 'text.primary',
          fontWeight: 600
        }}>
        {value}
      </Typography>
    </Stack>
    {copiable && (
      <Tooltip title="Copia">
        <IconButton size="small" onClick={() => navigator.clipboard.writeText(value)}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Stack>
);
