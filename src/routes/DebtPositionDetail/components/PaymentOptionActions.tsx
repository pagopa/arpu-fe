import { Button, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DebtorInstallmentsOverviewDTO,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import { addItem, deleteItem, isItemInCart, toggleCartDrawer } from 'store/CartStore';
import utils from 'utils';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface paymentOptionsActionProps {
  selectPaymentOptionType: PaymentOptionType;
  installments: DebtorInstallmentsOverviewDTO[];
  orgName: string;
  orgId: string;
}

const PaymentOptionsActions = (props: paymentOptionsActionProps) => {
  const { selectPaymentOptionType, installments, orgName: paFullName, orgId: paTaxCode } = props;
  const { t } = useTranslation();

  const singleInstallmentItemId = installments[0].iuv;

  if (!singleInstallmentItemId) {
    throw new Error('iuv is required field for Installment Item');
  }

  const addItemToCart = () => {
    try {
      // Assuming that add action is only for SINGLE_INSTALLMENT
      const { iuv, nav, remittanceInformation: description, amountCents: amount } = installments[0];
      if (!iuv || !nav || !amount) {
        throw new Error('Something went wrong trying to add the item: missing required data');
      }
      addItem({
        paFullName,
        description,
        amount,
        iuv,
        nav,
        paTaxCode
      });
      toggleCartDrawer();
    } catch (e) {
      utils.notify.emit((e as Error).message);
    }
  };

  const removeItemFromCart = () => deleteItem(singleInstallmentItemId);

  return (
    <Stack direction="row" spacing={2} marginTop={2} justifyContent="flex-end">
      {selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT &&
      !isItemInCart(singleInstallmentItemId) ? (
        <Button
          startIcon={<ShoppingCartIcon />}
          variant="outlined"
          size="large"
          data-testid="payment-option-action-add"
          onClick={addItemToCart}>
          {t('app.debtPositionDetail.addItemToCart')}
        </Button>
      ) : (
        <Button
          color="error"
          variant="outlined"
          size="large"
          data-testid="payment-option-action-add"
          onClick={removeItemFromCart}>
          {' '}
          {t('app.debtPositionDetail.removeItemFromCart')}
        </Button>
      )}
      <Button variant="contained" size="large" data-testid="payment-option-action-pay">
        {selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT
          ? t('app.debtPositionDetail.payNow')
          : t('app.debtPositionDetail.payLater')}
      </Button>
    </Stack>
  );
};

export default PaymentOptionsActions;
