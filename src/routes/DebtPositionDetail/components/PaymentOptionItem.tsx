import Card from '@mui/material/Card';
import { DebtorPaymentOptionOverviewDTO, PaymentOptionType } from '../../../../generated/data-contracts';
import React from 'react';
import { Chip, FormControlLabel, Radio, Stack, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent/TimelineContent';

const ExtraInfo = (props: { installments: DebtorPaymentOptionOverviewDTO['installments'] }) => {
  return <Timeline       sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}>
    {props.installments.map((installment, index) => (
      <TimelineItem key={installment.installmentId}>
        <TimelineSeparator>
          <TimelineDot />
          { index < props.installments.length - 1 && <TimelineConnector /> }
        </TimelineSeparator>
        <TimelineContent>{`Rata ${index + 1} ${installment.amountCents} ${installment.status} entro il ${installment.dueDate}`} </TimelineContent>
      </TimelineItem>
    ))}
  </Timeline>;
}

interface PaymentOptionProps extends DebtorPaymentOptionOverviewDTO {
  selectionStatus: 'selected' | 'unselected' | 'disabled';
}

const PaymentOption = (props: PaymentOptionProps) => {
  const isSelected = props.selectionStatus === 'selected';
  const paymentOptionType = props.paymentOptionType;

  return (
    <Card
      sx={{
        border: 2,
        color: isSelected ? 'primary.main' : 'divider',
        padding: 3
      }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack>
          <FormControlLabel
            value={props.paymentOptionId}
            control={<Radio />}
            label={props.paymentOptionType}
          />
          {
            paymentOptionType === PaymentOptionType.INSTALLMENTS && <Chip label={`${props.installments.length} Rate`} />
          }
        </Stack>
        <Stack>
          <Typography>{props.installments[0].amountCents}</Typography>
          <Typography>{props.installments[0].dueDate}</Typography>
        </Stack>
      </Stack>
      { paymentOptionType === PaymentOptionType.INSTALLMENTS && isSelected ?
        <ExtraInfo installments={props.installments} /> : null
      }
    </Card>
  );
};

export default PaymentOption;
