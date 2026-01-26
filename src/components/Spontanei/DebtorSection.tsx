import React from 'react';
import {
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '.';
import { PersonEntityType } from '../../../generated/apiClient';
import utils from 'utils';

const DebtorSection = ({ hasFlagAnonymousFiscalCode }: { hasFlagAnonymousFiscalCode: boolean }) => {
  const [fullName, fullNameMeta] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode, fiscalCodeMeta, fiscalCodeHelper] =
    useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email, emailMeta] = useField<PaymentNoticeInfo['email']>('email');
  const [entityType, , entityTypeHelper] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [isChecked, setIsChecked] = React.useState(false);
  const isFisica = entityType.value === PersonEntityType.F;
  const isAnonymous = utils.storage.user.isAnonymous();

  const handleChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      fiscalCodeHelper.setValue('ANONIMO');
    }
    setIsChecked(checked);
  };

  return (
    <>
      <FormControl>
        <RadioGroup
          row
          onChange={(_e: React.ChangeEvent<HTMLInputElement>, value) => {
            entityTypeHelper.setValue(value as PersonEntityType);
            fiscalCodeHelper.setValue('');
          }}
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="F"
          name="entityType">
          <FormControlLabel value="F" control={<Radio />} label="Persona fisica" />
          <FormControlLabel value="G" control={<Radio />} label="Soggetto giuridico" />
        </RadioGroup>
      </FormControl>
      <Card variant="outlined" sx={{ padding: 2 }}>
        <Stack gap={2}>
          <Typography variant="h6">Dati del debitore</Typography>
          {isFisica && !isAnonymous && (
            <FormControlLabel control={<Switch />} label="Usa i tuoi dati" />
          )}
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
              disabled={isChecked && isFisica}
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
          {isFisica && hasFlagAnonymousFiscalCode && (
            <FormControlLabel
              control={<Checkbox onChange={(event, checked) => handleChange(event, checked)} />}
              label="Non ho il Codice Fiscale"
            />
          )}
        </Stack>
      </Card>
    </>
  );
};

export default DebtorSection;
