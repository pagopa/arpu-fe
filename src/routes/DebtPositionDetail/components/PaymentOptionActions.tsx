import { Button, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentOptionType } from '../../../../generated/data-contracts';

interface paymentOptionsActionProps {
  selectPaymentOptionType: PaymentOptionType;
}

const PaymentOptionsActions = (props: paymentOptionsActionProps) => {
  const { selectPaymentOptionType } = props;
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={2} marginTop={2} justifyContent="flex-end">
      {selectPaymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT && (
        <Button variant="outlined" size="large" data-testid="payment-option-action-add">
          {t('app.debtPositionDetail.addItemToCart')}
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
