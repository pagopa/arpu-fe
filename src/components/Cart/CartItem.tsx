import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { cartDrawerStyles } from './CartDrawer.styles';
import { toEuroOrMissingValue } from 'utils/converters';
import { ButtonNaked } from '@pagopa/mui-italia';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteItem } from 'store/CartStore';
import { CartItem } from 'models/Cart';

const CartItem = (props: Omit<CartItem, 'nav' | 'paTaxCode' | 'allCCP'>) => {
  const theme = useTheme();
  const styles = cartDrawerStyles(theme);
  const { t } = useTranslation();
  const { paFullName: title, description, amount, iuv: id } = props;

  return (
    <Stack sx={styles.itemContainer}>
      <Grid container justifyContent={'space-between'} flexWrap="nowrap" alignItems="center">
        <Grid size="grow" sx={{ minWidth: 0 }}>
          <Typography variant="body1" fontWeight={600} noWrap title={title}>
            {title}
          </Typography>
          <Typography variant="caption" component="p" noWrap title={description}>
            {description}
          </Typography>
        </Grid>
        <Grid size="auto" sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
          <Typography variant="body1" fontWeight={600} mr={2}>
            {toEuroOrMissingValue(amount)}
          </Typography>
          <ButtonNaked
            color="error"
            onClick={() => deleteItem(id)}
            aria-label={t('ui.a11y.removeCartItem')}
            name="removeCartItemButton"
            sx={{ padding: 0 }}>
            <DeleteIcon />
          </ButtonNaked>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CartItem;
