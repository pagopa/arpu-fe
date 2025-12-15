import Card from '@mui/material/Card';
import {
  DebtorPaymentOptionOverviewDTO,
  PaymentOptionType
} from '../../../../generated/data-contracts';
import React from 'react';
import { Box, Chip, Divider, FormControlLabel, Grid, Radio, Stack, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent/TimelineContent';
import utils from 'utils';
import { useTranslation } from 'react-i18next';

const Accent = (props: { children: string }) => (
  <Box
    sx={{ display: 'inline-block', backgroundColor: '#e1f5fe', borderRadius: '4px', paddingX: 1 }}>
    <Typography color="#215C76">{props.children}</Typography>
  </Box>
);

const ExtraInfo = (props: { installments: DebtorPaymentOptionOverviewDTO['installments'] }) => {
  const { t } = useTranslation();
  return (
    <>
      <Divider sx={{ mt: 2 }} />
      <Timeline
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0
          },
          mb:0,
          padding: 0,
          paddingLeft: 4,
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
                  <Stack direction="row" spacing={2}>
                    <Accent>{`Rata ${index + 1}`}</Accent>
                    <Typography component="span">
                      {utils.converters.toEuro(installment.amountCents || 0)}
                    </Typography>
                  </Stack>
                </Grid>
            
                <Grid size={6} gap={2}>
                  <Stack direction="row" spacing={2}>
                    <Chip label={t(`app.debtPositionDetail.status.${installment.status}`)} />
                    <Typography component="span">{`${t('app.debtPositionDetail.before')} ${utils.datetools.formatDate(installment.dueDate)}`}</Typography>
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
  const paymentOptionType = props.paymentOptionType;

  const label =
    paymentOptionType === PaymentOptionType.SINGLE_INSTALLMENT ? (
      <Typography variant="body2" textTransform="uppercase">
        {t('app.debtPositionDetail.paymentOptionSingleInstallment')}
      </Typography>
    ) : (
      <div>
        <Typography variant="body2" textTransform="uppercase">
          {t('app.debtPositionDetail.paymentOptionRateInstallments')}
        </Typography>
        <Accent>{`${props.installments.length} ${t('app.debtPositionDetail.installments')}`}</Accent>
      </div>
    );

  return (
    <Card
      sx={{
        border: 2,
        color: isSelected ? 'primary.main' : 'divider',
        padding: 3
      }}>
      <Grid container>
        <Grid size={6}>
          <FormControlLabel value={props.paymentOptionId} control={<Radio />} label={label} />
        </Grid>
        <Grid size={6} pl={2}>
          <Typography>{utils.converters.toEuro(props.installments[0].amountCents || 0)}</Typography>
          <Typography>
            {utils.datetools.formatDate(props.installments[0].dueDate)}
          </Typography>
        </Grid>
      </Grid>
      {paymentOptionType === PaymentOptionType.INSTALLMENTS && isSelected ? (
        <ExtraInfo installments={props.installments} />
      ) : null}
    </Card>
  );
};

export default PaymentOption;
