import React from 'react';
import { Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '.';
import { PersonEntityType } from '../../../generated/arpu-be/apiClient';

const DebtorSection = () => {
  const [fullName, fullNameMeta] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode, fiscalCodeMeta] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email, emailMeta] = useField<PaymentNoticeInfo['email']>('email');
  const [type, , meta] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const isFisica = type.value === PersonEntityType.F;

  return (
    <>
      <Typography variant="h6" mt={2} mb={2}>
        Dati intestatario
      </Typography>
      <ToggleButtonGroup
        color="primary"
        exclusive
        aria-label="Platform"
        value={type.value}
        onChange={(_, value: PersonEntityType) => meta.setValue(value)}>
        <ToggleButton value="F" name={type.name}>
          Fisica
        </ToggleButton>
        <ToggleButton value="G" name={type.name}>
          Giuridica
        </ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row" gap={2} mt={2}>
        <TextField
          label={isFisica ? 'Nome e Cognome' : 'Denominazione'}
          variant="outlined"
          required
          {...fullName}
          error={fullNameMeta.touched && Boolean(fullNameMeta.error)}
          helperText={fullNameMeta.touched && fullNameMeta.error}
          sx={{ width: '-webkit-fill-available' }}
        />
        <TextField
          label={isFisica ? 'Codice fiscale' : 'Partita IVA'}
          variant="outlined"
          required
          {...fiscalCode}
          error={fiscalCodeMeta.touched && Boolean(fiscalCodeMeta.error)}
          helperText={fiscalCodeMeta.touched && fiscalCodeMeta.error}
          sx={{ width: '-webkit-fill-available' }}
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          {...email}
          error={emailMeta.touched && Boolean(emailMeta.error)}
          helperText={emailMeta.touched && emailMeta.error}
          sx={{ width: '-webkit-fill-available' }}
        />
      </Stack>
    </>
  );
};

export default DebtorSection;
