import React from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import { OrganizationsWithSpontaneousDTO } from '../../../../generated/data-contracts';
import Controls from '../Controls';
import { useField, useFormikContext } from 'formik';
import { PaymentNoticeInfo } from '..';

const OrgSelect = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();

  const formik = useFormikContext<PaymentNoticeInfo>();
  const [, meta, helpers] = useField<PaymentNoticeInfo['org']>('org');

  const { data: orgs } = isAnonymous
    ? utils.loaders.public.getPublicOrganizationsWithSpontaneous(brokerId)
    : utils.loaders.getOrganizationsWithSpontaneous(brokerId);

  const orgOptions = orgs || [];

  const handleOrgChange = (
    _event: React.SyntheticEvent<Element, Event>,
    organization: OrganizationsWithSpontaneousDTO | string | null
  ) => {
    if (!organization || typeof organization === 'string') {
      helpers.setValue(null);
    } else {
      const selectedOrg =
        orgs?.find((o) => o.organizationId === organization?.organizationId) || null;
      helpers.setValue(selectedOrg);
    }
  };

  const shouldContinue = async () => {
    formik.setTouched({ org: true });
    const errors = await formik.validateForm();
    return !errors.org;
  };

  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step1.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step1.description')}</Typography>
          <Autocomplete
            onChange={handleOrgChange}
            id="spontanei.form.steps.step1.orgSelectLabel"
            freeSolo
            options={orgOptions}
            value={meta.value}
            getOptionKey={(org) => (org as OrganizationsWithSpontaneousDTO).organizationId}
            getOptionLabel={(org) => (org as OrganizationsWithSpontaneousDTO).orgName}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('spontanei.form.steps.step1.search')}
                name="org"
                required
                error={meta.touched && Boolean(meta.error)}
                helperText={meta.touched && t(meta.error as string)}
              />
            )}
          />
        </Stack>
      </Card>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default OrgSelect;
