import React, { useEffect } from 'react';
import {
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
import { useUserInfo } from 'hooks/useUserInfo';
import { useUserEmail } from 'hooks/useUserEmail';
import { useUserFiscalCode } from 'hooks/useUserFiscalCode';
import { ResponsiveCard } from 'components/ResponsiveCard';

type DebtorSectionProps = {
  hasFlagAnonymousFiscalCode?: boolean;
  allowedEntityType?: PersonEntityType;
};

const DebtorSection = ({ allowedEntityType, hasFlagAnonymousFiscalCode }: DebtorSectionProps) => {
  const [fullName, fullNameMeta, fullNameHelper] =
    useField<PaymentNoticeInfo['fullName']>('fullName');
  const [fiscalCode, fiscalCodeMeta, fiscalCodeHelper] =
    useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [email, emailMeta, emailHelper] = useField<PaymentNoticeInfo['email']>('email');
  const [entityType, , entityTypeHelper] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [isFlagNoFiscalCodeChecked, setIsFlagNoFiscalCodeChecked] = React.useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (allowedEntityType) {
      entityTypeHelper.setValue(allowedEntityType);
    }
  }, [allowedEntityType]);

  const isAnonymous = utils.storage.user.isAnonymous();
  // Get user info if not anonymous
  const { userInfo } = isAnonymous ? { userInfo: null } : useUserInfo();

  // Prepare payer full name
  const name = userInfo?.name || '';
  const surname = userInfo?.familyName || '';
  const payerFullName = `${name} ${surname}`;

  // Get user email if not anonymous
  const payerEmail = isAnonymous ? '' : useUserEmail() || '';

  // Get user fiscal code if not anonymous
  const payerFiscalCode = isAnonymous ? '' : useUserFiscalCode() || '';

  const isFisica = entityType.value === PersonEntityType.F;

  const handleFlagNoFiscalCode = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      fiscalCodeHelper.setValue('ANONIMO');
    }
    setIsFlagNoFiscalCodeChecked(checked);
  };

  const handleEntityTypeChange = (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    entityTypeHelper.setValue(value as PersonEntityType);
    fiscalCodeHelper.setValue('');
  };

  const handleUseYourDataSwitch = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      fullNameHelper.setValue(payerFullName);
      emailHelper.setValue(payerEmail);
      if (!isFlagNoFiscalCodeChecked) {
        fiscalCodeHelper.setValue(payerFiscalCode);
      }
    }
  };

  return (
    <>
      {allowedEntityType ? null : (
        <FormControl sx={{ my: 3 }}>
          <RadioGroup
            row
            onChange={handleEntityTypeChange}
            aria-labelledby="entityType-radio-buttons-group-label"
            defaultValue="F"
            name="entityType">
            <FormControlLabel
              value="F"
              control={<Radio />}
              label={t('spontanei.form.steps.step3.debtor.F.title')}
            />
            <FormControlLabel
              value="G"
              control={<Radio />}
              label={t('spontanei.form.steps.step3.debtor.G.title')}
            />
          </RadioGroup>
        </FormControl>
      )}
      <ResponsiveCard variant="outlined">
        <Stack gap={2}>
          <Typography variant="h6">{t('spontanei.form.steps.step3.debtor.title')}</Typography>
          {isFisica && !isAnonymous && (
            <FormControlLabel
              control={<Switch sx={{ mx: 1 }} onChange={handleUseYourDataSwitch} />}
              label={t('spontanei.form.steps.step3.debtor.useYourData')}
            />
          )}
          <Stack
            direction={{ sx: 'column', md: 'row' }}
            gap={{ xs: 2, sm: 1 }}
            my={{ xs: 1, md: 0 }}>
            <TextField
              label={
                isFisica
                  ? t('spontanei.form.steps.step3.debtor.F.name')
                  : t('spontanei.form.steps.step3.debtor.G.name')
              }
              variant="outlined"
              required
              {...fullName}
              id="fullName"
              error={fullNameMeta.touched && Boolean(fullNameMeta.error)}
              helperText={fullNameMeta.touched && fullNameMeta.error}
              sx={{ width: '-webkit-fill-available' }}
            />
            <TextField
              label={
                isFisica
                  ? t('spontanei.form.steps.step3.debtor.F.code')
                  : t('spontanei.form.steps.step3.debtor.G.code')
              }
              variant="outlined"
              required
              disabled={isFlagNoFiscalCodeChecked && isFisica}
              {...fiscalCode}
              id="fiscalCode"
              error={fiscalCodeMeta.touched && Boolean(fiscalCodeMeta.error)}
              helperText={fiscalCodeMeta.touched && fiscalCodeMeta.error}
              sx={{ width: '-webkit-fill-available' }}
            />
            <TextField
              label={
                isFisica
                  ? t('spontanei.form.steps.step3.debtor.F.email')
                  : t('spontanei.form.steps.step3.debtor.G.email')
              }
              variant="outlined"
              type="email"
              required
              {...email}
              id="email"
              error={emailMeta.touched && Boolean(emailMeta.error)}
              helperText={emailMeta.touched && emailMeta.error}
              sx={{ width: '-webkit-fill-available' }}
            />
          </Stack>
          {isFisica && hasFlagAnonymousFiscalCode && (
            <FormControlLabel
              control={<Checkbox onChange={handleFlagNoFiscalCode} />}
              label={t('spontanei.form.steps.step3.debtor.noFiscalCode')}
            />
          )}
        </Stack>
      </ResponsiveCard>
    </>
  );
};

export default DebtorSection;
