import React from 'react';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { useTranslation } from 'react-i18next';
import utils from 'utils';

interface UnpayableItemsProps {
  items: InstallmentDrawerItem[];
  totalItems: number;
}

export const UnpayableItems = ({ items, totalItems }: UnpayableItemsProps) => {
  const [open, setOpen] = React.useState(true);
  const { t } = useTranslation();
  const handleToggle = () => {
    setOpen(!open);
  };
  return (
    <>
      <Divider />
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderWidth: 1,
          mt: 3
        }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography>{t('app.installmentsDrawer.expiredInstallments')}</Typography>
          <IconButton aria-label="add" onClick={handleToggle}>
            {open ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
          </IconButton>
        </Stack>
        {open && (
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <p>
                  {item.rateIndex} di {totalItems}
                </p>
                <p>Scaduta</p>

                {item.amountCents && <p>{utils.converters.toEuro(item.amountCents)}</p>}
                {item.dueDate && <p>{utils.datetools.formatDate(item.dueDate)}</p>}
              </li>
            ))}
          </ul>
        )}
      </Box>
    </>
  );
};
