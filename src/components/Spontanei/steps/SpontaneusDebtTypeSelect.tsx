import React from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import { DebtPositionTypeOrgsWithSpontaneousDTO } from '../../../../generated/arpu-be/data-contracts';

interface SpontaneusDebtTypeSelectrops {
  organizationId: number;
  setSpontaneusDebtTypes: (
    spontaneusDebtTypes: DebtPositionTypeOrgsWithSpontaneousDTO | null
  ) => void;
}

const SpontaneusDebtTypeSelect = (props: SpontaneusDebtTypeSelectrops) => {
  const { data: DebtPositionTypeOrgsWithSpontaneous } =
    utils.loaders.getDebtPositionTypeOrgsWithSpontaneous(props.organizationId);
  const { t } = useTranslation();

  return (
    <Card variant="outlined">
      <Stack spacing={2} padding={4}>
        <Typography variant="h6">{t('spontanei.form.steps.step2.title')}</Typography>
        <Typography>{t('spontanei.form.steps.step2.description')}</Typography>
        <Autocomplete
          onChange={(_, opt) =>
            props.setSpontaneusDebtTypes(
              (opt as DebtPositionTypeOrgsWithSpontaneousDTO | null) || null
            )
          }
          freeSolo
          options={DebtPositionTypeOrgsWithSpontaneous?.map(({ description }) => description) || []}
          renderInput={(params) => <TextField {...params} label="Cerca per nome del servizio" />}
        />
      </Stack>
    </Card>
  );
};

export default SpontaneusDebtTypeSelect;
