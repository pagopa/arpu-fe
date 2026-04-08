import React, { useEffect, useState } from 'react';

import {
  Tabs,
  Tab,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Content } from 'components/Content';
import loaders, { InstallmentType } from 'utils/loaders';
import { useFormik } from 'formik';
import { InstallmentStatus } from '../../../generated/data-contracts';
import { Results } from './components/Results';
import notify from 'utils/notify';
import storage from 'utils/storage';
import URI from 'utils/URI';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

enum TabIndex {
  PERSONA_FISICA = 0,
  PERSONA_GIURIDICA = 1
}

interface FormValues {
  iuvOrNav: string;
  fiscalCode: string;
  anonymous?: boolean;
}

interface IuvSearchProps {
  titleKey: string;
  descriptionKey: string;
  subtitleKey?: string;
  tab1DescriptionKey?: string;
  tab2DescriptionKey?: string;
  noDataTitleKey?: string;
  noDataTextKey?: string;
  searchErrorKey?: string;
  resultKey: string;
  installmentType?: InstallmentType;
}

export const IuvSearch = ({
  titleKey,
  descriptionKey,
  subtitleKey,
  tab1DescriptionKey,
  tab2DescriptionKey,
  noDataTitleKey,
  noDataTextKey,
  installmentType = InstallmentType.ALL,
  resultKey
}: IuvSearchProps) => {
  const { t } = useTranslation();
  const brokerId = storage.app.getBrokerId();
  // get initial values from hash params
  const { iuvOrNav, fiscalCode, anonymous, initialTab } = URI.decode(window.location.hash);
  const initialValues: FormValues = { iuvOrNav, fiscalCode, anonymous: anonymous === 'true' };
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState(Number(initialTab) || TabIndex.PERSONA_FISICA);
  const installmentsMutation = loaders.public.usePublicInstallmentsByIuvOrNav(brokerId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    // only keep iuvOrNav when changing tabs
    formik.setValues((values) => ({ ...values, fiscalCode: '', anonymous: false }));
    installmentsMutation.reset();
    setCurrentTab(newValue);
  };

  const isTab1 = currentTab === TabIndex.PERSONA_FISICA;

  const validate = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.iuvOrNav || values.iuvOrNav.trim() === '') {
      errors.iuvOrNav = t('errors.form.required');
    }

    if (!values.anonymous && (!values.fiscalCode || values.fiscalCode.trim() === '')) {
      errors.fiscalCode = t('errors.form.required');
    }

    return errors;
  };

  const onSubmit = async (values: FormValues) => {
    await formik.validateForm();
    if (formik.isValid) {
      // send 'ANONIMO' to api when anonymous is checked
      const fiscalCode = isTab1 && values.anonymous ? 'ANONIMO' : values.fiscalCode;
      try {
        await installmentsMutation.mutateAsync({
          iuvOrNav: values.iuvOrNav,
          fiscalCode,
          statuses:
            installmentType === InstallmentType.RECEIPTS ? [InstallmentStatus.PAID] : undefined
        });

        const params = {
          iuvOrNav: values.iuvOrNav,
          anonymous: values.anonymous,
          initialTab: currentTab,
          // don't encode fiscalCode to URI when anonymous is checked
          fiscalCode: isTab1 && values.anonymous ? '' : values.fiscalCode
        };
        const encodedParams = URI.encode(params);
        URI.set(encodedParams, { replace: true });
      } catch {
        notify.emit(t('errors.toast.default'));
      }
    }
  };

  const onBack = () => {
    navigate(-1);
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit
  });

  useEffect(() => {
    if (iuvOrNav && ((isTab1 && anonymous) || fiscalCode)) {
      onSubmit(formik.values);
    }
  }, []);

  const tabA11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`
    };
  };

  return (
    <>
      <Stack sx={{ justifyContent: 'center' }}>
        <Stack sx={{ gap: 2 }}>
          <Stack gap={1}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {t(titleKey)}
            </Typography>
            <Typography variant="body1">{t(descriptionKey)}</Typography>
          </Stack>
          <form onSubmit={formik.handleSubmit} aria-label={t('ui.a11y.searchForm')}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="tabs">
              <Tab label={t('common.person')} {...tabA11yProps(TabIndex.PERSONA_FISICA)} />
              <Tab label={t('common.company')} {...tabA11yProps(TabIndex.PERSONA_GIURIDICA)} />
            </Tabs>
            <Stack sx={{ backgroundColor: 'background.paper', p: 3, borderRadius: 1, gap: 3 }}>
              {subtitleKey && (
                <Typography variant="h6" component="h2" fontWeight={700}>
                  {t(subtitleKey)}
                </Typography>
              )}
              {(tab1DescriptionKey || tab2DescriptionKey) && (
                <Typography variant="body1" maxWidth={800}>
                  {isTab1 && tab1DescriptionKey
                    ? t(tab1DescriptionKey)
                    : tab2DescriptionKey
                      ? t(tab2DescriptionKey)
                      : ''}
                </Typography>
              )}
              <Stack direction="row" gap={3}>
                <TextField
                  fullWidth
                  label={t('fields.iuv')}
                  name="iuvOrNav"
                  id="iuvOrNav"
                  error={formik.touched.iuvOrNav && Boolean(formik.errors.iuvOrNav)}
                  helperText={formik.touched.iuvOrNav && formik.errors.iuvOrNav}
                  value={formik.values.iuvOrNav}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <TextField
                  fullWidth
                  label={isTab1 ? t('fields.fiscalcode') : t('fields.piva')}
                  name="fiscalCode"
                  id="fiscalCode"
                  disabled={formik.values.anonymous}
                  error={formik.touched.fiscalCode && Boolean(formik.errors.fiscalCode)}
                  helperText={formik.touched.fiscalCode && formik.errors.fiscalCode}
                  value={formik.values.anonymous ? '' : formik.values.fiscalCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Stack>
              {isTab1 && (
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.anonymous}
                        onChange={formik.handleChange}
                        name="anonymous"
                      />
                    }
                    label={t('fields.anonymous')}
                  />
                </Box>
              )}
              <Stack alignItems="flex-end">
                <Button size="large" variant="contained" type="submit">
                  {t('actions.search')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
        <Stack gap={3} mt={3}>
          {installmentsMutation.isSuccess && resultKey && (
            <Typography component="h3" fontWeight={600}>
              {t(resultKey, { count: installmentsMutation?.data?.length || 0 })}
            </Typography>
          )}
          <Content
            showRetry={installmentsMutation.isError}
            onRetry={() => onSubmit(formik.values)}
            queryKey={['publicInstallmentsByIuvOrNav', brokerId]}
            noDataText={noDataTextKey ? t(noDataTextKey) : ''}
            noDataTitle={noDataTitleKey ? t(noDataTitleKey) : ''}
            noData={installmentsMutation.isSuccess && !installmentsMutation.data?.length}>
            <Results
              installments={installmentsMutation.data || []}
              installmentType={installmentType}
            />
          </Content>
        </Stack>
      </Stack>
      {installmentsMutation.isSuccess && (
        <Button
          size="large"
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBack />}
          sx={{ mt: !installmentsMutation.data?.length ? 3 : 0 }}>
          {t('app.routes.exit')}
        </Button>
      )}
    </>
  );
};
