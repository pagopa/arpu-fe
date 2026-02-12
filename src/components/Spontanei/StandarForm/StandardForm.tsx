import React from 'react';
import { Card, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DebtorSection from '../DebtorSection';
import { useField, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { PaymentNoticeInfo } from '..';
import Controls from '../Controls';

const StandardForm = (props: { fixedAmount?: number; hasFlagAnonymousFiscalCode?: boolean }) => {
  const { t } = useTranslation();
  const formik = useFormikContext<PaymentNoticeInfo>();
  const [amount, amountMeta, amountHelpers] = useField<PaymentNoticeInfo['amount']>('amount');
  const [description, descriptionMeta] = useField<PaymentNoticeInfo['description']>('description');

  useEffect(() => {
    if (props.fixedAmount !== undefined) {
      amountHelpers.setValue(props.fixedAmount / 100);
    } else {
      amountHelpers.setValue(0);
    }
  }, [props.fixedAmount]);

  const shouldContinue = async () => {
    formik.handleSubmit();
    const errors = await formik.validateForm();
    return !errors.amount && !errors.description && !errors.fullName && !errors.fiscalCode;
  };

  return (
    <>
      <Card sx={{ padding: 3 }}>
        <Stack gap={2}>
          <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
          <Typography color="error.dark">
            {t('spontanei.form.steps.step3.requiredField')}
          </Typography>
        </Stack>

        <Stack gap={2}>
          <DebtorSection hasFlagAnonymousFiscalCode={props.hasFlagAnonymousFiscalCode || false} />
          <Card variant="outlined" sx={{ padding: 3 }}>
            <Stack gap={2}>
              <Typography variant="h6">
                {t('spontanei.form.steps.step3.paymentData.title')}
              </Typography>
              <Stack direction="row" justifyContent={'space-between'} spacing={2}>
                <TextField
                  size="small"
                  label={t('spontanei.form.steps.step3.paymentData.amount')}
                  variant="outlined"
                  required
                  slotProps={{
                    input: {
                      startAdornment: <InputAdornment position="start">€</InputAdornment>
                    }
                  }}
                  type="number"
                  disabled={props.fixedAmount !== undefined}
                  {...amount}
                  error={amountMeta.touched && Boolean(amountMeta.error)}
                  helperText={amountMeta.touched && amountMeta.error}
                />
                <TextField
                  size="small"
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
          </Card>
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default StandardForm;
