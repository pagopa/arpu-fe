import Card from '@mui/material/Card';
import {
  DebtorInstallmentsOverviewDTO,
  DebtorPaymentOptionOverviewDTO,
  InstallmentStatus,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import React from 'react';
import {
  Box,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Radio,
  Stack,
  Typography
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent/TimelineContent';
import utils from 'utils';
import { useTranslation } from 'react-i18next';

export const Accent = (props: { children: string }) => (
  <Box
    sx={{ display: 'inline-block', backgroundColor: '#e1f5fe', borderRadius: '4px', paddingX: 1 }}>
    <Typography color="#215C76" textTransform="capitalize" fontWeight={600} fontSize={14}>
      {props.children}
    </Typography>
  </Box>
);

const getInstallmentStatusColor = (status: InstallmentStatus) => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'UNPAID':
      return 'default';
    case 'EXPIRED':
      return 'error';
    default:
      return 'default';
  }
};

export const InstallmentStatusChip = ({
  dataTestId,
  status
}: {
  dataTestId?: string;
  status: InstallmentStatus;
}) => {
  const { t } = useTranslation();
  return (
    <Chip
      data-testid={dataTestId}
      label={t(`app.debtPositionDetail.status.${status}`)}
      color={getInstallmentStatusColor(status)}
    />
  );
};

const ExtraInfo = (props: { installments: DebtorPaymentOptionOverviewDTO['installments'] }) => {
  const { t } = useTranslation();

  return (
    <>
      <Divider sx={{ mt: 2 }} data-testid="payment-option-item-type-installments-extra-info" />
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0
          },
          mb: 0,
          padding: 0,
          paddingLeft: 4
        }}>
        {props.installments.map((installment, index) => (
          <TimelineItem key={installment.installmentId}>
            <TimelineSeparator>
              <TimelineDot />
              {index < props.installments.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Grid container>
                <Grid size={6}>
                  <Stack
                    direction="row"
                    spacing={2}
                    data-testid={`payment-option-type-installments-installment-${index + 1}`}>
                    <Accent>{`${t('app.debtPositionDetail.installment')} ${index + 1}`}</Accent>
                    <Typography
                      fontWeight={600}
                      fontStyle="semibold"
                      component="span"
                      data-testid={`payment-option-type-installments-installment-${index + 1}-amount`}>
                      {utils.converters.toEuro(installment.amountCents || 0)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={6} gap={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <InstallmentStatusChip
                      dataTestId={`payment-option-type-installments-installment-${index + 1}-status`}
                      status={installment.status}
                    />
                    {installment.dueDate && (
                      <Typography
                        fontSize={16}
                        fontStyle="semibold"
                        color="text.secondary"
                        data-testid={`payment-option-type-installments-installment-${index + 1}-due-date`}>{`${t('app.debtPositionDetail.before')} ${utils.datetools.formatDate(installment.dueDate)}`}</Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </>
  );
};

interface PaymentOptionProps extends DebtorPaymentOptionOverviewDTO {
  selectionStatus: 'selected' | 'unselected' | 'disabled';
}

const PaymentOption = (props: PaymentOptionProps) => {
  const { t } = useTranslation();
  const isSelected = props.selectionStatus === 'selected';
  const isDisabled = props.selectionStatus === 'disabled';
  const paymentOptionType = props.paymentOptionType;

  const isSingleInstallment =
    paymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT ||
    paymentOptionType === PaymentOptionType.REDUCED_SINGLE_INSTALLMENT ||
    (paymentOptionType === PaymentOptionType.DOWN_PAYMENT && props.installments.length === 1);

  const label = isSingleInstallment ? (
    <Typography
      variant="overline"
      textTransform="uppercase"
      color={isDisabled ? 'text.disabled' : 'text.primary'}>
      {t('app.debtPositionDetail.paymentOptionSingleInstallment')}
    </Typography>
  ) : (
    <>
      <Typography
        variant="overline"
        textTransform="uppercase"
        display="block"
        mb={1}
        color={isDisabled ? 'text.disabled' : 'text.primary'}>
        {t('app.debtPositionDetail.paymentOptionInstallments')}
      </Typography>
      <Accent>{`${props.installments.length} ${t('app.debtPositionDetail.installments')}`}</Accent>
    </>
  );

  const nextInstallmentToBePaid: { installment?: DebtorInstallmentsOverviewDTO; index: number } = {
    installment: props.installments.find(
      (installment) => installment.dueDate && installment.status === 'UNPAID'
    ),
    index:
      props.installments.findIndex(
        (installment) => installment.dueDate && installment.status === 'UNPAID'
      ) + 1
  };

  const nextInstallmentToBePaidLabel = isSingleInstallment
    ? `${t('app.debtPositionDetail.before')} ${utils.datetools.formatDate(nextInstallmentToBePaid.installment?.dueDate)}`
    : `${t('app.debtPositionDetail.installment')} ${nextInstallmentToBePaid.index}  ${t('app.debtPositionDetail.before')} ${utils.datetools.formatDate(nextInstallmentToBePaid.installment?.dueDate)}`;

  return (
    <Card
      sx={{
        border: 2,
        color: isSelected ? 'primary.main' : 'divider',
        padding: 3
      }}>
      <Grid container>
        <Grid size={6}>
          <FormControlLabel
            disabled={props.selectionStatus === 'disabled'}
            data-testid="payment-option-item-type"
            value={props.paymentOptionId}
            control={<Radio />}
            label={label}
          />
        </Grid>
        <Grid size={6} pl={2}>
          <Typography
            data-testid="payment-option-item-total-amount"
            fontWeight={600}
            color={isDisabled ? 'text.disabled' : 'text.primary'}
            fontStyle="semibold">
            {utils.converters.toEuro(props.totalAmountCents || 0)}
          </Typography>
          {nextInstallmentToBePaid.installment && (
            <Typography
              data-testid="payment-option-item-next-pay-date"
              fontSize={16}
              fontStyle="semibold"
              color={isDisabled ? 'text.disabled' : 'text.secondary'}>
              {nextInstallmentToBePaidLabel}
            </Typography>
          )}
        </Grid>
      </Grid>
      {paymentOptionType === PaymentOptionType.INSTALLMENTS && isSelected ? (
        <ExtraInfo installments={props.installments} />
      ) : null}
    </Card>
  );
};

export default PaymentOption;
