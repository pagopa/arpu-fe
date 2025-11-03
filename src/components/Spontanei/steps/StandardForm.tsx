import React from 'react';
import { Card, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StaticFormSection from '../DinamicForm/StaticFormSection';
import { Payment } from '../Form';
import { useField } from 'formik';
import { useEffect } from 'react';

const StandardForm = (props: { fixedAmount?: number }) => {
  const { t } = useTranslation();
  const [payee, payeeMeta] = useField<Payment['payee']>('payee');
  const [payeeId, payeeIdMeta] = useField<Payment['payeeId']>('payeeId');
  const [amount, amountMeta, amountHelpers] = useField<Payment['amount']>('amount');
  const [causale, causaleMeta] = useField<Payment['causale']>('causale');

  useEffect(() => {
    if (props.fixedAmount !== undefined) {
      amountHelpers.setValue(props.fixedAmount / 100);
    } else {
      amountHelpers.setValue(0);
    }
  }, [props.fixedAmount]);

  return (
    <Card variant="outlined">
      <Stack spacing={2} padding={4}>
        <Typography variant="h6">{t('spontanei.form.steps.step3.title')}</Typography>
        <Typography>{t('spontanei.form.steps.step3.description')}</Typography>
        <Stack direction="row" justifyContent={'space-between'} spacing={2}>
          <TextField
            label="Nome Cognome / Ragione Sociale"
            variant="outlined"
            required
            {...payee}
            error={payeeMeta.touched && Boolean(payeeMeta.error)}
            helperText={payeeMeta.touched && payeeMeta.error}
            sx={{ width: '-webkit-fill-available' }}
          />
          <TextField
            label="Codice Fiscale / Partita IVA"
            variant="outlined"
            required
            {...payeeId}
            error={payeeIdMeta.touched && Boolean(payeeIdMeta.error)}
            helperText={payeeIdMeta.touched && payeeIdMeta.error}
            sx={{ width: '-webkit-fill-available' }}
          />
        </Stack>
        <Stack direction="row" justifyContent={'space-between'} spacing={2}>
          <TextField
            label="Importo (€)"
            variant="outlined"
            type="number"
            required
            disabled={props.fixedAmount !== undefined}
            {...amount}
            error={amountMeta.touched && Boolean(amountMeta.error)}
            helperText={amountMeta.touched && amountMeta.error}
          />
          <TextField
            label="Causale"
            variant="outlined"
            required
            {...causale}
            error={causaleMeta.touched && Boolean(causaleMeta.error)}
            helperText={causaleMeta.touched && causaleMeta.error}
            sx={{ width: '-webkit-fill-available' }}
          />
        </Stack>
        <StaticFormSection />
      </Stack>
    </Card>
  );
};

export default StandardForm;
