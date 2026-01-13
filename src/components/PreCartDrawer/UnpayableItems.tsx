import React from 'react';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { Box, IconButton, Stack, Typography } from '@mui/material';

export const UnpayableItems = () => {
  const [open, setOpen] = React.useState(true);

  const handleToggle = () => {
    setOpen(!open);
  };
  return (
    <Box
      sx={{ p: 2, borderRadius: 1, borderStyle: 'solid', borderColor: 'divider', borderWidth: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography>Rate Scadute</Typography>
        <IconButton aria-label="add" onClick={handleToggle}>
          {open ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
        </IconButton>
      </Stack>
      {open && (
        <ul>
          <p>rata 1</p>
          <p>rata 2</p>
        </ul>
      )}
    </Box>
  );
};
