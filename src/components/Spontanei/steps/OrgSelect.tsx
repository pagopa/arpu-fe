import React, { useContext } from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { OrganizationsWithSpontaneousDTO } from '../../../../generated/arpu-be/data-contracts';
import FormContext, { FormContextType } from '../FormContext';
import Controls from '../Controls';

interface OrgOptions {
  label: OrganizationsWithSpontaneousDTO['orgName'];
  value: OrganizationsWithSpontaneousDTO['organizationId'];
}

const OrgSelect = () => {
  const { t } = useTranslation();
  const { brokerId = '1' } = useParams();
  const { data: orgs } = utils.loaders.getOrganizationsWithSpontaneous(parseInt(brokerId, 10));

  const orgOptions: OrgOptions[] =
    orgs?.map((org) => ({ label: org.orgName, value: org.organizationId })) || [];

  const context = useContext<FormContextType | null>(FormContext);

  const handleOrgChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string | OrgOptions | null
  ) => {
    if (value && typeof value !== 'string' && context) {
      const selectedOrg =
        orgs?.find((o) => o.organizationId === (value as OrgOptions).value) || null;
      return context.setOrg(selectedOrg);
    }
  };

  const shouldContinue = () => context?.org !== null;

  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step1.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step1.description')}</Typography>
          <Autocomplete
            onChange={handleOrgChange}
            id="free-solo-demo"
            freeSolo
            options={orgOptions}
            renderInput={(params) => <TextField {...params} label="Cerca per nome dell'ente" />}
          />
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default OrgSelect;
