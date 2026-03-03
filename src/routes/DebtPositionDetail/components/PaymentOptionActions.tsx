import { Button, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DebtorInstallmentsOverviewDTO,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import { addItem, deleteItem, isItemInCart, toggleCartDrawer } from 'store/CartStore';
import { openInstallmentsDrawer } from 'store/installmentsDrawer';
import utils from 'utils';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { usePostCarts } from 'hooks/usePostCarts';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'routes/routes';
import { useUserEmail } from 'hooks/useUserEmail';
import appStore from 'store/appStore';

interface paymentOptionsActionProps {
  selectPaymentOptionType: PaymentOptionType;
  selectedPaymentOptionId: number;
  debtPositionId: number;
  installments: DebtorInstallmentsOverviewDTO[];
  orgName: string;
  orgId: string;
}

const PaymentOptionsActions = (props: paymentOptionsActionProps) => {
  const email = useUserEmail();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    selectPaymentOptionType,
    selectedPaymentOptionId,
    installments,
    orgName: paFullName,
    orgId: paTaxCode,
    debtPositionId
  } = props;

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => navigate(ROUTES.public.COURTESY_PAGE.replace(':error', error))
  });

  const singleInstallmentItemId = installments[0].iuv;

  if (!singleInstallmentItemId) {
    throw new Error('iuv is required field for Installment Item');
  }

  const addItemToCart = () => {
    try {
      // Assuming that add action is only for SINGLE_INSTALLMENT
      const {
        iuv,
        nav,
        remittanceInformation: description,
        amountCents: amount,
        installmentId
      } = installments[0];
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
        paymentOptionId: selectedPaymentOptionId
      });
      toggleCartDrawer();
    } catch (e) {
      utils.notify.emit((e as Error).message);
    }
  };

  const payItem = () => {
    try {
      // ASSUMING SIGLE INSTALLMENT
      const {
        iuv,
        nav,
        amountCents: amount,
        remittanceInformation: description
      } = props.installments[0];
      if (!iuv || !nav || !amount) {
        throw new Error('Something went wrong trying to add the item: missing required data');
      }

      const cartItem = {
        iuv: singleInstallmentItemId,
        nav,
        description,
        amount,
        paFullName,
        paTaxCode
      };
      carts.mutate({ notices: [cartItem], email });
    } catch (e) {
      utils.notify.emit((e as Error).message);
    }
  };

  const onPayButtonClick = () => {
    if (selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT) {
      payItem();
    } else {
      openInstallmentsDrawer(
        installments.map((inst, index) => ({
          ...inst,
          rateIndex: index + 1,
          paFullName,
          paTaxCode,
          debtPositionId,
          paymentOptionId: selectedPaymentOptionId
        }))
      );
    }
  };

  const removeItemFromCart = () => deleteItem(singleInstallmentItemId);

  return (
    <Stack direction="row" spacing={2} marginTop={2} justifyContent="flex-end">
      {appStore.value.brokerInfo?.config?.useCart &&
        selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT &&
        !isItemInCart(singleInstallmentItemId) && (
          <Button
            startIcon={<ShoppingCartIcon />}
            variant="outlined"
            size="large"
            data-testid="payment-option-action-add"
            onClick={addItemToCart}>
            {t('app.debtPositionDetail.addItemToCart')}
          </Button>
        )}
      {selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT &&
        isItemInCart(singleInstallmentItemId) && (
          <Button
            color="error"
            variant="outlined"
            size="large"
            data-testid="payment-option-action-remove"
            onClick={removeItemFromCart}>
            {t('app.debtPositionDetail.removeItemFromCart')}
          </Button>
        )}
      <Button
        variant="contained"
        size="large"
        data-testid="payment-option-action-pay"
        onClick={onPayButtonClick}>
        {selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT
          ? t('app.debtPositionDetail.payNow')
          : t('app.debtPositionDetail.payLater')}
      </Button>
    </Stack>
  );
};

export default PaymentOptionsActions;
