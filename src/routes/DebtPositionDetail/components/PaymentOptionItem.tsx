import Card from '@mui/material/Card';
import { DebtorPaymentOptionOverviewDTO } from '../../../../generated/data-contracts';
import React from 'react';
import { FormControlLabel, Radio, Stack, Typography } from '@mui/material';

interface PaymentOptionProps extends DebtorPaymentOptionOverviewDTO {
  selectionStatus: 'selected' | 'unselected' | 'disabled';
}

const PaymentOption = (props: PaymentOptionProps) => {
  return (
    <Card
      sx={{
        border: 2,
        color: props.selectionStatus === 'selected' ? 'primary.main' : 'divider',
        padding: 3
      }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row">
          <FormControlLabel
            value={props.paymentOptionId}
            control={<Radio />}
            label={props.paymentOptionType}
          />
        </Stack>
        <Stack>
          <Typography>{props.installments[0].amountCents}</Typography>
          <Typography>{props.installments[0].dueDate}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

export default PaymentOption;
