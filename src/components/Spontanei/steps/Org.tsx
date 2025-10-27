import React from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { OrganizationsWithSpontaneousDTO } from '../../../../generated/arpu-be/data-contracts';

interface OrgSelectEnteProps {
  setOrg: (org: OrganizationsWithSpontaneousDTO | null) => void;
}

interface OrgOptions {
  label: OrganizationsWithSpontaneousDTO['orgName'];
  value: OrganizationsWithSpontaneousDTO['organizationId'];
}

const OrgSelect = (props: OrgSelectEnteProps) => {
  const { t } = useTranslation();
  const { brokerId = '1' } = useParams();
  const { data: orgs } = utils.loaders.getOrganizationsWithSpontaneous(parseInt(brokerId, 10));

  const options: OrgOptions[] =
    orgs?.map((org) => ({ label: org.orgName, value: org.organizationId })) || [];

  return (
    <Card variant="outlined">
      <Stack spacing={2} padding={4}>
        <Typography variant="h6">{t('spontanei.form.steps.step1.title')}</Typography>
        <Typography>{t('spontanei.form.steps.step1.description')}</Typography>
        <Autocomplete
          onChange={(_, opt) => {
            if (opt) {
              props.setOrg(
                orgs?.find((o) => o.organizationId === (opt as OrgOptions).value) || null
              );
            } else {
              props.setOrg(null);
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

export default OrgSelect;
