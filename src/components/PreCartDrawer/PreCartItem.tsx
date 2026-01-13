import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const PreCartItem = () => {
  return (
    <Stack direction="row">
      <IconButton aria-label="add">
        <AddCircleIcon />
      </IconButton>
      <Box
        sx={{
          py: 1,
          px: 2,
          borderRadius: 1,
          borderColor: 'divider',
          borderWidth: '1px',
          borderStyle: 'solid',
          flexGrow: 1
        }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack>
            <Typography>Rata 1 di 3</Typography>
            <Typography>Entro il 30/11/2025</Typography>
          </Stack>
          <Typography>296,56 $</Typography>
        </Stack>
      </Box>
    </Stack>
  );
};

export default PreCartItem;
