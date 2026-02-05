import React, { useEffect, useMemo } from 'react';
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
import { installmentsDrawerStyles } from './InstallmentsDrawer.styles';
import { useStore } from 'store/GlobalStore';
import { usePostCarts } from 'hooks/usePostCarts';
import { useUserEmail } from 'hooks/useUserEmail';
import InstallmentItem from './InstallmentItem';
import ExpiredInstallmentItems from './ExpiredInstallmentItems';
import { closeInstallmentsDrawer } from 'store/installmentsDrawer';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { InstallmentStatus } from '../../../generated/data-contracts';
import { addItem, toggleCartDrawer, setCartEmail } from 'store/CartStore';
import utils from 'utils';
import { CartItem } from 'models/Cart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const InstallmentsDrawer = () => {
  const [addedInstallments, setAddedInstallments] = React.useState<InstallmentDrawerItem[]>([]);

  const { t } = useTranslation();
  const theme = useTheme();
  const styles = installmentsDrawerStyles(theme);
  const navigate = useNavigate();

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => navigate(ArcRoutes.COURTESY_PAGE.replace(':error', error))
  });

  const email = useUserEmail();

  const {
    state: { installmentsDrawer }
  } = useStore();

  const onPayButton = () => {
    payItems();
    closeInstallmentsDrawer();
  };

  const totalItems = installmentsDrawer.items.length;

  const unpaidInstallments = useMemo(
    () => installmentsDrawer.items.filter((item) => item.status === InstallmentStatus.UNPAID),
    [installmentsDrawer.items]
  );

  const expiredInstallments = useMemo(
    () => installmentsDrawer.items.filter((item) => item.status === InstallmentStatus.EXPIRED),
    [installmentsDrawer.items]
  );

  useEffect(() => {
    // Preselect the first unpaid installment
    setAddedInstallments([unpaidInstallments[0]]);
  }, [unpaidInstallments]);

  const canBeAddedInstallments = useMemo(
    () => unpaidInstallments.filter((item) => !addedInstallments.includes(item)),
    [unpaidInstallments, addedInstallments]
  );

  const addInstallment = (item: InstallmentDrawerItem) => {
    setAddedInstallments((prev) => [...prev, item]);
  };

  const removeInstallment = (item: InstallmentDrawerItem) => {
    if (addedInstallments.length === 1) return; // Prevent removing the last installment
    setAddedInstallments((prev) => prev.filter((i) => i.iuv !== item.iuv));
  };

  const addToCart = () => {
    try {
      setCartEmail(email);
      addedInstallments.forEach((installment) => {
        const {
          paFullName,
          paTaxCode,
          debtPositionId,
          paymentOptionId,
          iuv,
          nav,
          remittanceInformation: description,
          amountCents: amount,
          installmentId
        } = installment;
        if (!iuv || !nav || !amount) {
          throw new Error('Something went wrong trying to add the item: missing required data');
        }
        addItem({
          paFullName,
          description,
          amount,
          iuv,
          nav,
          paTaxCode,
          installmentId,
          debtPositionId,
          paymentOptionId
        });
      });
      toggleCartDrawer();
      closeInstallmentsDrawer();
    } catch (error) {
      console.error(error);
    }
  };

  type MaybeCorruptedCartItem = {
    iuv?: string;
    nav?: string;
    description: string;
    amount?: number;
    paFullName: string;
    paTaxCode: string;
  };

  function checkItemsIntegrity(items: MaybeCorruptedCartItem[]): items is CartItem[] {
    for (const item of items) {
      if (!item.iuv || !item.nav || !item.amount) {
        return false;
      }
    }
    return true;
  }

  const payItems = () => {
    try {
      const payItems: MaybeCorruptedCartItem[] = addedInstallments.map((installment) => {
        const {
          iuv,
          nav,
          remittanceInformation: description,
          amountCents: amount,
          paFullName,
          paTaxCode
        } = installment;
        return {
          iuv,
          nav,
          description,
          amount,
          paFullName,
          paTaxCode
        };
      });

      if (payItems.length === 0) {
        throw new Error('No items to pay');
      }
      if (checkItemsIntegrity(payItems)) {
        carts.mutate({ notices: payItems, email });
      } else {
        throw new Error('Missing required data in items to pay');
      }
    } catch (e) {
      utils.notify.emit((e as Error).message);
    }
  };

  return (
    <>
      <Box sx={styles.container} component="aside" aria-label={t('app.installmentsDrawer')}>
        <Stack justifyContent="space-between" height="100%">
          <Stack>
            {/* Header Section */}
            <Box>
              <Stack direction="row" sx={styles.header}>
                <ButtonNaked
                  onClick={closeInstallmentsDrawer}
                  aria-label={t('app.installmentsDrawer.close')}>
                  <CloseIcon />
                </ButtonNaked>
              </Stack>
              <Stack mb={4} spacing={1}>
                <Typography variant="h6" fontSize={24} fontWeight={700}>
                  {t('app.installmentsDrawer.title')}
                </Typography>
                <Typography fontSize={16}>{t('app.installmentsDrawer.description')}</Typography>
              </Stack>
            </Box>

            {/* Already selected installments section*/}
            <Box>
              <Typography variant="overline">
                {t('app.installmentsDrawer.selectedInstallments')}
              </Typography>
              <Stack spacing={3} my={3}>
                {addedInstallments.map((item) => (
                  <InstallmentItem
                    key={item.iuv}
                    item={item}
                    totalItems={totalItems}
                    type="added"
                    action={removeInstallment}
                  />
                ))}
              </Stack>
            </Box>

            {/* Available installments section */}
            {canBeAddedInstallments.length > 0 && (
              <Box>
                <Typography variant="overline">
                  {t('app.installmentsDrawer.availableInstallments')}
                </Typography>
                <Stack spacing={3} my={3}>
                  {canBeAddedInstallments.map((item) => (
                    <InstallmentItem
                      key={item.iuv}
                      item={item}
                      totalItems={totalItems}
                      type="available"
                      action={addInstallment}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* unpayble installments section */}
            {expiredInstallments.length > 0 && (
              <ExpiredInstallmentItems items={expiredInstallments} totalItems={totalItems} />
            )}
          </Stack>

          {/* Action Button */}
          <Stack justifyContent="center" spacing={2}>
            <Button
              startIcon={<ShoppingCartIcon />}
              variant="outlined"
              size="large"
              onClick={addToCart}>
              {t('app.installmentsDrawer.actions.add', { count: addedInstallments.length })}
            </Button>

            <Button
              variant="contained"
              size="large"
              onClick={onPayButton}
              id="installment-drawer-pay-button">
              {t('app.installmentsDrawer.actions.pay', { count: addedInstallments.length })}
            </Button>
          </Stack>
        </Stack>
      </Box>
      {/* Overlay */}
      <Box
        sx={styles.overlay}
        aria-hidden="true"
        role="presentation"
        onClick={closeInstallmentsDrawer}
      />
    </>
  );
};

export default InstallmentsDrawer;
