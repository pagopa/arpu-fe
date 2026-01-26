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
import { useTranslation } from 'react-i18next';

const DebtorSection = ({ hasFlagAnonymousFiscalCode }: { hasFlagAnonymousFiscalCode: boolean }) => {
  const [fullName, fullNameMeta] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode, fiscalCodeMeta, fiscalCodeHelper] =
    useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email, emailMeta] = useField<PaymentNoticeInfo['email']>('email');
  const [entityType, , entityTypeHelper] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [isChecked, setIsChecked] = React.useState(false);
  const { t } = useTranslation();
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
      <FormControl sx={{ my: 3 }}>
        <RadioGroup
          row
          onChange={(_e: React.ChangeEvent<HTMLInputElement>, value) => {
            entityTypeHelper.setValue(value as PersonEntityType);
            fiscalCodeHelper.setValue('');
          }}
          aria-labelledby="entityType-radio-buttons-group-label"
          defaultValue="F"
          name="entityType">
          <FormControlLabel value="F" control={<Radio />} label="Persona fisica" />
          <FormControlLabel value="G" control={<Radio />} label="Soggetto giuridico" />
        </RadioGroup>
      </FormControl>
      <Card variant="outlined" sx={{ padding: 3 }}>
        <Stack gap={2}>
          <Typography variant="h6">{t('spontanei.form.steps.step3.debtor.title')}</Typography>
          {isFisica && !isAnonymous && (
            <FormControlLabel
              control={<Switch sx={{ mx: 1 }} />}
              label={t('spontanei.form.steps.step3.debtor.useYourData')}
            />
          )}
          <Stack direction="row" gap={1}>
            <TextField
              size="small"
              label={
                isFisica
                  ? t('spontanei.form.steps.step3.debtor.F.name')
                  : t('spontanei.form.steps.step3.debtor.G.name')
              }
              variant="outlined"
              required
              {...fullName}
              error={fullNameMeta.touched && Boolean(fullNameMeta.error)}
              helperText={fullNameMeta.touched && fullNameMeta.error}
              sx={{ width: '-webkit-fill-available' }}
            />
            <TextField
              size="small"
              label={
                isFisica
                  ? t('spontanei.form.steps.step3.debtor.F.code')
                  : t('spontanei.form.steps.step3.debtor.G.code')
              }
              variant="outlined"
              required
              disabled={isChecked && isFisica}
              {...fiscalCode}
              error={fiscalCodeMeta.touched && Boolean(fiscalCodeMeta.error)}
              helperText={fiscalCodeMeta.touched && fiscalCodeMeta.error}
              sx={{ width: '-webkit-fill-available' }}
            />
            <TextField
              size="small"
              label={
                isFisica
                  ? t('spontanei.form.steps.step3.debtor.F.email')
                  : t('spontanei.form.steps.step3.debtor.G.email')
              }
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
              label={t('spontanei.form.steps.step3.debtor.noFiscalCode')}
            />
          )}
        </Stack>
      </Card>
    </>
  );
};

export default DebtorSection;
