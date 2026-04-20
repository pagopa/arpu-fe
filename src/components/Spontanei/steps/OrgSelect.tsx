import React, { useContext } from 'react';
import { Autocomplete, Stack, TextField, Typography } from '@mui/material';
import utils from 'utils';
import { useTranslation } from 'react-i18next';
import { OrganizationsWithSpontaneousDTO } from '../../../../generated/data-contracts';
import Controls from '../Controls';
import FormContext, { FormContextType } from '../FormContext';
import { useField, useFormikContext } from 'formik';
import { PaymentNoticeInfo } from '..';
import StepWrapper from './StepWrapper';

/**
 * This component is responsible for selecting the organization. As first step of Spontanei form.
 * @returns JSX.Element
 */
const OrgSelect = () => {
  const { t } = useTranslation();
  const context = useContext<FormContextType | null>(FormContext);
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();

  const formik = useFormikContext<PaymentNoticeInfo>();
  const [, meta, helpers] = useField<PaymentNoticeInfo['org']>('org');
  const [, , debtTypeHelpers] = useField<PaymentNoticeInfo['debtType']>('debtType');

  const serviceQuery = isAnonymous
    ? utils.loaders.public.getPublicOrganizationsWithSpontaneous(brokerId)
    : utils.loaders.getOrganizationsWithSpontaneous(brokerId);

  const orgs = serviceQuery.data;

  /**
   * If there is only one organization, it is selected automatically and the user is moved to the next step.
   */
  React.useEffect(() => {
    if (orgs?.length === 1 && !meta.value && context?.step.current === 0) {
      // set the only org as value
      helpers.setValue(orgs[0]);
      debtTypeHelpers.setValue(null);
      // omit the first step in steppers
      context && context.setOmitFirstStep(true);
      context?.setStep({ current: 1, previous: 1 });
    }
  }, [orgs, meta.value, helpers, context]);

  const orgOptions = orgs || [];

  const idInputElement = 'spontanei.form.steps.step1.orgSelectLabel';

  const handleOrgChange = (
    _event: React.SyntheticEvent<Element, Event>,
    organization: OrganizationsWithSpontaneousDTO | string | null
  ) => {
    debtTypeHelpers.setValue(null);
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
    if (errors.org) {
      document.getElementById(idInputElement)?.focus();
    }
    return !errors.org;
  };

  return (
    <>
      <StepWrapper isPending={serviceQuery.isPending}>
        <Stack spacing={2} padding={2}>
          <Typography variant="h4" component="h2" data-testid="spontanei-step1-title">
            {t('spontanei.form.steps.step1.title')}
          </Typography>
          <Typography data-testid="spontanei-step1-description">
            {t('spontanei.form.steps.step1.description')}
          </Typography>
          <Autocomplete
            data-testid="spontanei-step1-search-input"
            onChange={handleOrgChange}
            id={idInputElement}
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
      </StepWrapper>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default OrgSelect;
