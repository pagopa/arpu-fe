import React, { useContext } from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import { DebtPositionTypeOrgsWithSpontaneousDTO } from '../../../../generated/arpu-be/data-contracts';
import FormContext, { FormContextType } from '../FormContext';
import Controls from '../Controls';

interface debtTypeOptions {
  label: DebtPositionTypeOrgsWithSpontaneousDTO['description'];
  value: DebtPositionTypeOrgsWithSpontaneousDTO['organizationId'];
}

const DebtTypeSelect = () => {
  const context = useContext<FormContextType | null>(FormContext);
  const { t } = useTranslation();

  const { data: DebtPositionTypeOrgsWithSpontaneous } =
    utils.loaders.getDebtPositionTypeOrgsWithSpontaneous(context?.org?.organizationId || 0);

  const debtTypeOptions: debtTypeOptions[] =
    DebtPositionTypeOrgsWithSpontaneous?.map((debtType) => ({
      label: debtType.description,
      value: debtType.debtPositionTypeOrgId
    })) || [];

  const handleDebtTypeChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string | debtTypeOptions | null
  ) => {
    if (value && typeof value !== 'string' && context) {
      const selectedDebtType =
        DebtPositionTypeOrgsWithSpontaneous?.find(
          (debtType) => debtType.debtPositionTypeOrgId === (value as debtTypeOptions).value
        ) || null;
      return context.setDebtType(selectedDebtType);
    }
  };

  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step2.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step2.description')}</Typography>
          <Autocomplete
            onChange={handleDebtTypeChange}
            freeSolo
            options={debtTypeOptions}
            renderInput={(params) => <TextField {...params} label="Cerca per nome del servizio" />}
          />
        </Stack>
      </Card>
      <Controls shouldContinue={() => context?.debtType !== null} />
    </>
  );
};

export default DebtTypeSelect;
