import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '.';
import { PersonEntityType } from '../../../generated/apiClient';

const DebtorSection = () => {
  const [fullName, fullNameMeta] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode, fiscalCodeMeta] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email, emailMeta] = useField<PaymentNoticeInfo['email']>('email');
  const [type] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const isFisica = type.value === PersonEntityType.F;

  return (
    <Stack gap={2}>
      <Typography variant="h6">Dati del debitore</Typography>
      <FormControlLabel control={<Switch defaultChecked />} label="Usa i tuoi dati" />
      <Stack direction="row" gap={1}>
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
      <FormControlLabel control={<Checkbox defaultChecked />} label="Non ho il Codice Fiscale" />
    </Stack>
  );
};

export default DebtorSection;
