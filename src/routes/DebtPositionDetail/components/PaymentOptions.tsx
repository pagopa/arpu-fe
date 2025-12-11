import React from 'react';
import {
  DebtorPaymentOptionOverviewDTO,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import { Card, RadioGroup, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PaymentOption from './PaymentOptionItem';
import PaymentOptionsActions from './PaymentOptionActions';

const PaymentOptionWrapper = (props: { paymentOptions: DebtorPaymentOptionOverviewDTO[] }) => {
  const { t } = useTranslation();

  const [value, setValue] = React.useState<
    DebtorPaymentOptionOverviewDTO['paymentOptionId'] | undefined
  >();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentOptionId = parseInt((event.target as HTMLInputElement).value, 10);
    setValue(paymentOptionId);
  };

  const selectPaymentOptionType: PaymentOptionType = props.paymentOptions.find(
    (option) => option.paymentOptionId === value
  )?.paymentOptionType!;

  console.log(value, selectPaymentOptionType);

  return (
    <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column', marginTop: 2 }}>
      <Typography variant="subtitle2" fontWeight={700}>
        {t('app.debtPositionDetail.paymentOptions')}
      </Typography>
      <RadioGroup name="payment-options-radio-buttons-group" value={value} onChange={handleChange}>
        <Stack gap={2}>
          {props.paymentOptions.map((option) => (
            <PaymentOption
              key={option.paymentOptionId}
              {...option}
              selectionStatus={option.paymentOptionId === value ? 'selected' : 'unselected'}
            />
          ))}
        </Stack>
      </RadioGroup>
      {value && <PaymentOptionsActions selectPaymentOptionType={selectPaymentOptionType} />}
    </Card>
  );
};

export default PaymentOptionWrapper;
