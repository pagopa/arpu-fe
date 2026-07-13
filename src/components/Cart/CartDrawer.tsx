import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, Divider, useTheme, Link } from '@mui/material';
import { deleteItem, toggleCartDrawer } from 'store/CartStore';
import { ButtonNaked } from '@pagopa/mui-italia';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import { OUTCOMES, ROUTES } from 'routes/routes';
import { cartDrawerStyles } from './CartDrawer.styles';
import { useStore } from 'store/GlobalStore';
import { toEuroOrMissingValue } from 'utils/converters';
import { usePostCarts } from 'hooks/usePostCarts';
import loaders from 'utils/loaders';
import CartItem from './CartItem';
import utils from 'utils';

export const CartDrawer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = cartDrawerStyles(theme);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // On the dedicated cart route the drawer is the whole page: it must not be
  // dismissable (no close icon, no overlay click-to-close).
  const isLocked = pathname === ROUTES.CART || pathname === ROUTES.public.CART;

  const brokerId = utils.storage.app.getBrokerId();
  const verifyPaidNotices = loaders.public.useVerifyPaidNotices(brokerId);

  const goToCourtesy = (outcome: string) =>
    navigate(generatePath(ROUTES.COURTESY_PAGE, { outcome }));

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => goToCourtesy(error),
    // Checkout returns 422 without telling which notice is unpayable. Probe each
    // notice for PAID status: if any turns out already paid, remove it from the
    // cart and show the talking "removed from cart" page. If none is paid (every
    // notice is payable, so the 422 has another cause), fall back to the generic
    // error page — same as when the probe itself fails.
    onUnprocessable: async (notices) => {
      try {
        const paidNotices = await verifyPaidNotices.mutateAsync(notices);
        if (paidNotices.length > 0) {
          paidNotices.forEach((notice) => deleteItem(notice.iuv));
          goToCourtesy(OUTCOMES[428]);
        } else {
          goToCourtesy(OUTCOMES[400]);
        }
      } catch {
        goToCourtesy(OUTCOMES[400]);
      }
    }
  });

  const {
    state: { cart }
  } = useStore();

  // retieving the last saved email from the cart store
  const { email } = cart;

  const isAnonymous = utils.storage.user.isAnonymous();

  const onEmptyButtonClick = () => {
    toggleCartDrawer();
    navigate(ROUTES.DEBT_POSITIONS);
  };

  const onPayButton = () => {
    carts.mutate({ notices: cart.items, email: email || undefined });
    toggleCartDrawer();
  };

  return (
    <>
      <Box sx={styles.container} component="aside" aria-label={t('app.cart.header.title')}>
        <Stack justifyContent="space-between" height="100%">
          {/* Header Section */}
          <Box>
            <Stack direction="row" sx={styles.header}>
              {!isLocked && (
                <ButtonNaked
                  onClick={toggleCartDrawer}
                  aria-label={t('app.cart.header.close')}
                  sx={{ padding: 0 }}>
                  <CloseIcon />
                </ButtonNaked>
              )}
            </Stack>
            <Stack sx={styles.cartSummary}>
              <Typography component="span" variant="h6">
                {t('app.cart.header.amount')}
              </Typography>
              <Typography component="span" variant="h6" id="drawer-cart-amount">
                {toEuroOrMissingValue(cart.amount)}
              </Typography>
            </Stack>
          </Box>

          {/* Empty Cart Message */}
          {cart.items.length === 0 && (
            <Box sx={styles.emptyCartMessage}>
              <Typography variant="subtitle1">{t('app.cart.empty.title')}</Typography>
              <Typography variant="body2">{t('app.cart.empty.description')}</Typography>
            </Box>
          )}

          {/* Cart Content */}
          {cart.items.length > 0 && (
            <Stack sx={styles.items}>
              <Alert severity="info">
                <Trans
                  i18nKey="app.cart.items.alert"
                  components={{
                    link1: (
                      <Link
                        target="_blank"
                        href="https://assistenza.ioapp.it/hc/it/articles/31008000237585-L-importo-%C3%A8-diverso-da-quello-previsto"
                      />
                    )
                  }}
                />
              </Alert>
              <Stack mt={2} divider={<Divider orientation="horizontal" flexItem />}>
                {cart.items.map((item) => (
                  <CartItem
                    key={item.iuv}
                    iuv={item.iuv}
                    paFullName={item.paFullName}
                    description={item.description}
                    amount={item.amount}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {/* Action Button */}
          <Stack justifyContent="center" sx={styles.actionButton} spacing={2}>
            {!isAnonymous && (
              <Button
                variant="outlined"
                size="large"
                data-testid="cart-back-button"
                onClick={onEmptyButtonClick}>
                {t('app.cart.items.back')}
              </Button>
            )}

            {
              // Show the pay button only if the cart is not empty
              cart.items.length > 0 && (
                <Button variant="contained" size="large" onClick={onPayButton} id="pay-button">
                  {t('app.cart.items.pay')}
                </Button>
              )
            }
          </Stack>
        </Stack>
      </Box>

      {/* Overlay */}
      {cart.isOpen && (
        <Box
          sx={styles.overlay}
          aria-hidden="true"
          role="presentation"
          onClick={isLocked ? undefined : toggleCartDrawer}
        />
      )}
    </>
  );
};
