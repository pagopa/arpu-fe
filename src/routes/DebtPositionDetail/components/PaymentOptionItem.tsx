import Card from '@mui/material/Card';
import {
  DebtorInstallmentsOverviewDTO,
  DebtorPaymentOptionOverviewDTO,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import React from 'react';
import { Box, Divider, FormControlLabel, Grid, Radio, Stack, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import utils from 'utils';
import { Trans, useTranslation } from 'react-i18next';
import { InstallmentChip } from 'components/StatusChips/InstallmentChip';

export const Accent = (props: { children: string }) => (
  <Box
    sx={{
      display: 'inline-block',
      textTransform: 'capitalize'
    }}>
    <Typography fontSize={18} whiteSpace="nowrap">
      {props.children}
    </Typography>
  </Box>
);

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
          paddingLeft: { xs: 0, sm: 4 }
        }}>
        {props.installments.map((installment, index) => (
          <TimelineItem key={installment.installmentId} data-testId={`installment-item`}>
            <TimelineSeparator>
              <TimelineDot />
              {index < props.installments.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ px: { xs: 1, sm: 2 } }}>
              <Grid container rowGap={1}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={{ xs: 1, md: 2 }}
                    alignItems={{ xs: 'flex-start', md: 'center' }}>
                    <InstallmentChip installment={installment} />
                    {installment.dueDate && (
                      <Typography
                        fontSize={16}
                        fontStyle="semibold"
                        color="text.secondary"
                        whiteSpace="nowrap"
                        data-testid={`payment-option-type-installments-installment-${index + 1}-due-date`}>
                        <Trans
                          i18nKey={`app.debtPositionDetail.dueDate.${installment.status}`}
                          values={{
                            dueDate: utils.datetools.formatDate(installment.dueDate),
                            paymentDateTime: utils.datetools.formatDate(installment.paymentDateTime)
                          }}
                        />
                      </Typography>
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
      <Grid container alignItems="center" rowGap={1}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControlLabel
            disabled={props.selectionStatus === 'disabled'}
            data-testid="payment-option-item-type"
            value={props.paymentOptionId}
            checked={isSelected}
            control={<Radio />}
            label={label}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} pl={{ xs: '31px', sm: 2 }}>
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
