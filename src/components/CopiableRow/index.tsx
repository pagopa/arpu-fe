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
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: copiable ? 'primary.main' : 'text.primary',
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
        {value}
      </Typography>
    </Stack>
    {copiable && (
      <Tooltip title="Copia">
        <IconButton
          color="primary"
          size="small"
          sx={{ flexShrink: 0, ml: 1 }}
          onClick={() => navigator.clipboard.writeText(value)}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Stack>
);
