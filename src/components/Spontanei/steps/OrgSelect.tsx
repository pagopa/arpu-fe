import React, { useContext, useEffect } from 'react';
import { Autocomplete, Card, Stack, TextField, Typography } from '@mui/material';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import { OrganizationsWithSpontaneousDTO } from '../../../../generated/data-contracts';
import FormContext, { FormContextType } from '../FormContext';
import Controls from '../Controls';
import { useFormikContext } from 'formik';
import { PaymentNoticeInfo } from '..';

interface OrgOptions {
  label: OrganizationsWithSpontaneousDTO['orgName'];
  value: OrganizationsWithSpontaneousDTO['organizationId'];
}

const OrgSelect = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();
  const formik = useFormikContext<PaymentNoticeInfo>();

  const { data: orgs } = isAnonymous
    ? utils.loaders.public.getPublicOrganizationsWithSpontaneous(brokerId)
    : utils.loaders.getOrganizationsWithSpontaneous(brokerId);

  const orgOptions: OrgOptions[] =
    orgs?.map((org) => ({ label: org.orgName, value: org.organizationId })) || [];

  const context = useContext<FormContextType | null>(FormContext);

  const handleOrgChange = (
    _event: React.SyntheticEvent<Element, Event>,
    organization: OrgOptions | string | null
  ) => {
    if (!organization || typeof organization === 'string') {
      formik.setFieldValue('orgName', organization || '');
    } else {
      const selectedOrg = orgs?.find((o) => o.organizationId === organization?.value) || null;
      formik.setFieldValue('orgName', selectedOrg?.orgName || '');
      context?.setOrg(selectedOrg);
    }
  };

  const shouldContinue = async () => {
    formik.handleSubmit();
    const errors = await formik.validateForm();
    return !errors.orgName && context?.org;
  };

  const onReset = () => {
    formik.setFieldValue('orgName', '');
    context?.setOrg(null);
  };

  useEffect(() => {
    formik.resetForm();
  }, []);

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
            onOpen={formik.handleBlur}
            options={orgOptions}
            onReset={onReset}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cerca per nome dell'ente"
                name="orgName"
                required
                error={formik.touched.orgName && Boolean(formik.errors.orgName)}
                helperText={formik.touched.orgName && formik.errors.orgName}
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
