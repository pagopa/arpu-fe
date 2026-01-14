import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import utils from 'utils';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';

interface InstallmentItemProps {
  item: InstallmentDrawerItem;
  totalItems: number;
}

const InstallmentItem = ({ item, totalItems }: InstallmentItemProps) => {
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
            <Typography>Rata {item.rateIndex} di {totalItems}</Typography>
            {
              /* Due date */
              item.dueDate && <Typography>Entro il {utils.datetools.formatDate(item.dueDate)}</Typography>
            }
          </Stack>
          {
            /* Amount */
            item.amountCents &&
            <Typography>{utils.converters.toEuro(item.amountCents)}</Typography>
          }
        </Stack>
      </Box>
    </Stack>
  );
};

export default InstallmentItem;
