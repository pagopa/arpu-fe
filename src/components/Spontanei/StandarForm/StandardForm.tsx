import React from 'react';
import { Card, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DebtorSection from '../DebtorSection';
import { useField, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';
import { PersonEntityType } from '../../../../generated/data-contracts';
import { ResponsiveCard } from 'components/ResponsiveCard';

type StandardFormProps = {
  fixedAmount?: number;
  hasFlagAnonymousFiscalCode?: boolean;
  allowedEntityType?: PersonEntityType;
};

const StandardForm = ({
  fixedAmount,
  hasFlagAnonymousFiscalCode,
  allowedEntityType
}: StandardFormProps) => {
  const { t } = useTranslation();
  const formik = useFormikContext<PaymentNoticeInfo>();
  const [amount, amountMeta, amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [description, descriptionMeta] = useField<PaymentNoticeInfo['description']>('description');

  useEffect(() => {
    if (fixedAmount !== undefined) {
      amountHelpers.setValue(fixedAmount);
    }
  }, [fixedAmount]);

  const shouldContinue = async () => {
    formik.handleSubmit();
    const errors = await formik.validateForm();
    return !errors.amount && !errors.description && !errors.fullName && !errors.fiscalCode;
  };

  return (
    <>
      <Card sx={{ padding: 3 }}>
        <Stack gap={2}>
          <Typography variant="h6" component={'h2'}>
            {t('spontanei.form.steps.step3.title')}
          </Typography>
          <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
          <Typography color="error.dark">
            {t('spontanei.form.steps.step3.requiredField')}
          </Typography>
        </Stack>

        <Stack gap={2}>
          <DebtorSection
            hasFlagAnonymousFiscalCode={hasFlagAnonymousFiscalCode}
            allowedEntityType={allowedEntityType}
          />
          <ResponsiveCard variant="outlined">
            <Stack gap={2}>
              <Typography variant="h6" component={'h2'}>
                {t('spontanei.form.steps.step3.paymentData.title')}
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent={'space-between'}
                spacing={2}>
                <TextField
                  label={t('spontanei.form.steps.step3.paymentData.amount')}
                  variant="outlined"
                  required
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">€</InputAdornment>
                    }
                  }}
                  type="number"
                  disabled={fixedAmount !== undefined}
                  {...amount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    amountHelpers.setValue(value * 100);
                  }}
                  value={amount.value / 100}
                  error={amountMeta.touched && Boolean(amountMeta.error)}
                  helperText={amountMeta.touched && amountMeta.error}
                />
                <TextField
                  label={t('spontanei.form.steps.step3.paymentData.description')}
                  variant="outlined"
                  required
                  {...description}
                  error={descriptionMeta.touched && Boolean(descriptionMeta.error)}
                  helperText={descriptionMeta.touched && descriptionMeta.error}
                  sx={{ width: '-webkit-fill-available' }}
                />
              </Stack>
            </Stack>
          </ResponsiveCard>
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default StandardForm;
