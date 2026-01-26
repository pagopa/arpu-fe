import React, { useContext } from 'react';
import {
  Autocomplete,
  Card,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import { DebtPositionTypeOrgsWithSpontaneousDTO } from '../../../../generated/data-contracts';
import FormContext, { FormContextType } from '../FormContext';
import Controls from '../Controls';

interface debtTypeOptions {
  label: DebtPositionTypeOrgsWithSpontaneousDTO['description'];
  value: DebtPositionTypeOrgsWithSpontaneousDTO['organizationId'];
}

const DebtTypeSelect = () => {
  const context = useContext<FormContextType | null>(FormContext);
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();
  const { t } = useTranslation();

  const { data: DebtPositionTypeOrgsWithSpontaneous } = isAnonymous
    ? utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneous(
        brokerId,
        context?.org?.organizationId || 0
      )
    : utils.loaders.getDebtPositionTypeOrgsWithSpontaneous(
        brokerId,
        context?.org?.organizationId || 0
      );

  const debtTypeOptions: debtTypeOptions[] =
    DebtPositionTypeOrgsWithSpontaneous?.map((debtType) => ({
      label: debtType.description,
      value: debtType.debtPositionTypeOrgId
    })) || [];

  const handleDebtTypeChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
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

  const mostUsedDebtTypesQuery = isAnonymous
    ? utils.loaders.public.getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
        brokerId,
        context?.org?.organizationId || 0
      )
    : utils.loaders.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
        brokerId,
        context?.org?.organizationId || 0
      );

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
          {mostUsedDebtTypesQuery.data && mostUsedDebtTypesQuery.data.length > 0 && (
            <>
              <Typography variant="subtitle1">
                {t('spontanei.form.steps.step2.mostUsedDebtTypes')}
              </Typography>
              <Stack
                sx={{ borderRadius: 1, border: '1px solid', borderColor: 'grey.300', px: 4, py: 2 }}
                spacing={2}>
                <RadioGroup aria-label="debt-type" name="debt-type-group">
                  {mostUsedDebtTypesQuery.data.map((debtType) => (
                    <FormControl key={debtType.debtPositionTypeOrgId}>
                      <FormControlLabel
                        value={debtType.debtPositionTypeOrgId}
                        control={
                          <Radio
                            onChange={() => context?.setDebtType(debtType)}
                            checked={
                              context?.debtType?.debtPositionTypeOrgId ===
                              debtType.debtPositionTypeOrgId
                            }
                          />
                        }
                        label={debtType.description}
                      />
                    </FormControl>
                  ))}
                </RadioGroup>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
      <Controls shouldContinue={async () => context?.debtType !== null} />
    </>
  );
};

export default DebtTypeSelect;
