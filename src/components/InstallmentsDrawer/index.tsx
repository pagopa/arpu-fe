import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia/dist/components/ButtonNaked';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArcRoutes } from 'routes/routes';
import { cartDrawerStyles } from './CartDrawer.styles';
import { useStore } from 'store/GlobalStore';
import { usePostCarts } from 'hooks/usePostCarts';
import { useUserEmail } from 'hooks/useUserEmail';
import PreCartItem from './InstallmentItem';
import { UnpayableItems } from './UnpayableItems';
import { closeInstallmentsDrawer } from 'store/installmentsDrawer';

const InstallmentsDrawer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = cartDrawerStyles(theme);
  const navigate = useNavigate();

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => navigate(ArcRoutes.COURTESY_PAGE.replace(':error', error))
  });

  const email = useUserEmail();

  const {
    state: { cart }
  } = useStore();

  const onEmptyButtonClick = () => {
    closeInstallmentsDrawer();
  };

  const onPayButton = () => {
    carts.mutate({ notices: cart.items, email });
    closeInstallmentsDrawer();
  };

  return (
    <>
      <Box sx={styles.container} component="aside" aria-label={t('app.cart.header.title')}>
        <Stack justifyContent="space-between" height="100%">
          {/* Header Section */}
          <Box>
            <Stack direction="row" sx={styles.header}>
              <ButtonNaked onClick={closeInstallmentsDrawer} aria-label={t('app.cart.header.close')}>

                <CloseIcon />
              </ButtonNaked>
            </Stack>
            <Stack>
              <Typography variant="h6">{t('app.preCart.header.title')}</Typography>
              <Typography>{t('app.preCart.header.description')}</Typography>
            </Stack>
          </Box>

          {/* Already selected installments section*/}
          <Box>
            <Typography>Stai per pagare</Typography>
            <Stack spacing={3}>
              <PreCartItem />
            </Stack>
          </Box>

          {/* Available installments section */}
          <Box>
            <Typography>Rate Disponibili:</Typography>
            <Stack spacing={3}>
              <PreCartItem />
              <PreCartItem />
            </Stack>
          </Box>

          {/* unpayble installments section */}
          <UnpayableItems />

          {/* Action Button */}
          <Stack justifyContent="center" sx={styles.actionButton} spacing={2}>
            <Button variant="outlined" size="large" onClick={onEmptyButtonClick}>
              {t('app.preCart.actions.add')}
            </Button>

            <Button variant="contained" size="large" onClick={onPayButton} id="pay-button">
              {t('app.preCart.actions.pay')}
            </Button>
          </Stack>
        </Stack>
      </Box>
      {/* Overlay */}
      (
      <Box sx={styles.overlay} aria-hidden="true" role="presentation" onClick={closeInstallmentsDrawer} />)
    </>
  );
};

export default InstallmentsDrawer;