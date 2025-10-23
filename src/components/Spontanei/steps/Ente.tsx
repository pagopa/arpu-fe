import React from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface SelezionaEnteProps {
  setEnte: (ente: { paFullName: string; paTaxCode: string } | null) => void;
}

interface OrgOption {
  label: string;
  value: string;
}
const SelezionaEnte = (props: SelezionaEnteProps) => {
  const { t } = useTranslation();
  const { brokerId = '1' } = useParams();
  const { data: orgs } = utils.loaders.getOrganizationsWithSpontaneous(parseInt(brokerId));

  const options: OrgOption[] =
    orgs?.map((org) => ({ label: org.orgName, value: org.orgFiscalCode })) || [];

  return (
    <Card variant="outlined">
      <Stack spacing={2} padding={4}>
        <Typography variant="h6">{t('spontanei.form.steps.step1.title')}</Typography>
        <Typography>{t('spontanei.form.steps.step1.description')}</Typography>
        <Autocomplete
          onChange={(_, opt) => {
            if (opt) {
              props.setEnte({
                paFullName: (opt as OrgOption).label,
                paTaxCode: (opt as OrgOption).value
              });
            } else {
              props.setEnte(null);
            }
          }}
          id="free-solo-demo"
          freeSolo
          options={options}
          renderInput={(params) => <TextField {...params} label="Cerca per nome dell'ente" />}
        />
      </Stack>
    </Card>
  );
};

export default SelezionaEnte;
