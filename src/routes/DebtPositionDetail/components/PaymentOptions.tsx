import React, { useEffect } from 'react';
import {
  DebtorInstallmentsOverviewDTO,
  DebtorPaymentOptionOverviewDTO,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import { Card, RadioGroup, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PaymentOptionItem from './PaymentOptionItem';
import PaymentOptionsActions from './PaymentOptionActions';

interface PaymentOptionWrapperProps {
  paymentOptions: DebtorPaymentOptionOverviewDTO[];
  debtPositionId: number;
  orgInfo: {
    orgName: string;
    orgId: string;
  };
}

const PaymentOptionWrapper = (props: PaymentOptionWrapperProps) => {
  const { t } = useTranslation();

  const [paymentOptionId, setpaymentOptionId] = React.useState<
    DebtorPaymentOptionOverviewDTO['paymentOptionId'] | undefined
  >();

  const [installments, setInstallments] = React.useState<DebtorInstallmentsOverviewDTO[]>([]);

  const selectPaymentOptionType: PaymentOptionType | undefined = props.paymentOptions.find(
    (option) => option.paymentOptionId === paymentOptionId
  )?.paymentOptionType;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const paymentOptionId = parseInt((event.target as HTMLInputElement).value, 10);
    setpaymentOptionId(paymentOptionId);
  };

  useEffect(() => {
    const selectePaymentMethod = props.paymentOptions.find(
      (option) => option.paymentOptionId === paymentOptionId
    );
    if (selectePaymentMethod) setInstallments(selectePaymentMethod.installments);
  }, [paymentOptionId]);

  return (
    <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column', marginTop: 2 }}>
      <Typography variant="body1" component="h2" fontWeight="600" fontStyle="semibold">
        {t('app.debtPositionDetail.paymentOptions')}
      </Typography>
      <RadioGroup
        name="payment-options-radio-buttons-group"
        value={paymentOptionId}
        onChange={handleChange}>
        <Stack gap={2}>
          {props.paymentOptions.map((option) => (
            <PaymentOptionItem
              key={option.paymentOptionId}
              {...option}
              selectionStatus={
                option.paymentOptionId === paymentOptionId ? 'selected' : 'unselected'
              }
            />
          ))}
        </Stack>
      </RadioGroup>
      {paymentOptionId && selectPaymentOptionType && installments.length > 0 && (
        <PaymentOptionsActions
          orgId={props.orgInfo.orgId}
          orgName={props.orgInfo.orgName}
          installments={installments}
          selectPaymentOptionType={selectPaymentOptionType}
          selectedPaymentOptionId={paymentOptionId}
          debtPositionId={props.debtPositionId}
        />
      )}
    </Card>
  );
};

export default PaymentOptionWrapper;
