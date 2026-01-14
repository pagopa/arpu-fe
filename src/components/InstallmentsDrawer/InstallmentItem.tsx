import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import utils from 'utils';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';

interface InstallmentItemProps {
  item: InstallmentDrawerItem;
  totalItems: number;
  type: 'added' | 'available';
  action: (item: InstallmentDrawerItem) => void;
}

const InstallmentItem = ({ item, totalItems, type, action }: InstallmentItemProps) => {
  return (
    <Stack direction="row">
      <IconButton aria-label="add">
        {type === 'added' ? (
          <RemoveCircleIcon onClick={() => action(item)} />
        ) : (
          <AddCircleIcon onClick={() => action(item)} />
        )}
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
            <Typography>
              Rata {item.rateIndex} di {totalItems}
            </Typography>
            {
              /* Due date */
              item.dueDate && (
                <Typography>Entro il {utils.datetools.formatDate(item.dueDate)}</Typography>
              )
            }
          </Stack>
          {
            /* Amount */
            item.amountCents && <Typography>{utils.converters.toEuro(item.amountCents)}</Typography>
          }
        </Stack>
      </Box>
    </Stack>
  );
};

export default InstallmentItem;
