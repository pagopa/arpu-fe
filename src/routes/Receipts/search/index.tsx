import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  Tabs,
  Tab,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Container,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BackButton } from 'components/BackButton';
import utils from 'utils';
import { Results } from './components/Results';
import { Content } from 'components/Content';

enum TabIndex {
  PERSONA_FISICA = 0,
  PERSONA_GIURIDICA = 1
}

const initialValues = {
  iuv: '',
  fiscalCode: '',
  anonymous: false
};

interface FormValues {
  iuv: string;
  fiscalCode: string;
  anonymous?: boolean;
}

export const ReceiptsSearch = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabIndex>(TabIndex.PERSONA_FISICA);
  const brokerId = utils.storage.app.getBrokerId();

  const installmentsMutation = utils.loaders.public.usePublicInstallmentsByIuvOrNav(brokerId);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    formik.setValues((values) => ({ ...values, fiscalCode: '', anonymous: false }));
    setCurrentTab(newValue);
  };

  const onSubmit = async (values: FormValues) => {
    await formik.validateForm();
    if (formik.isValid) {
      const fiscalCode = isTab1 && values.anonymous ? 'ANONIMO' : values.fiscalCode;
      try {
        await installmentsMutation.mutateAsync({
          iuvOrNav: values.iuv,
          fiscalCode: fiscalCode
        });
      } catch {
        utils.notify.emit(t('app.receiptsSearch.searchError'));
      }
    }
  };

  const isTab1 = currentTab === TabIndex.PERSONA_FISICA;

  const validate = (values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.iuv || values.iuv.trim() === '') {
      errors.iuv = t('errors.form.required');
    }

    if (!values.anonymous && (!values.fiscalCode || values.fiscalCode.trim() === '')) {
      errors.fiscalCode = t('errors.form.required');
    }

    return errors;
  };

  const formik = useFormik({
    initialValues,
    validate,
    onSubmit
  });

  return (
    <Stack sx={{ justifyContent: 'center', backgroundColor: 'background.default' }}>
      <Container sx={{ p: 4 }}>
        <Box mb={-3}>
          <BackButton />
        </Box>
        <Stack sx={{ gap: 2 }}>
          <Stack gap={1}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              {t('app.receiptsSearch.title')}
            </Typography>
            <Typography variant="body1">{t('app.receiptsSearch.description')}</Typography>
          </Stack>
          <form onSubmit={formik.handleSubmit}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label={t('app.receiptsSearch.tab1.label')} />
              <Tab label={t('app.receiptsSearch.tab2.label')} />
            </Tabs>
            <Stack sx={{ backgroundColor: 'background.paper', p: 3, borderRadius: 1, gap: 3 }}>
              <Typography variant="h6" component="h2" fontWeight={700}>
                {t('app.receiptsSearch.sub')}
              </Typography>
              <Typography variant="body1" maxWidth={800}>
                {isTab1
                  ? t('app.receiptsSearch.tab1.description')
                  : t('app.receiptsSearch.tab2.description')}
              </Typography>
              <Stack direction="row" gap={3}>
                <TextField
                  fullWidth
                  label={t('app.receiptsSearch.fields.iuv')}
                  name="iuv"
                  id="iuv"
                  error={formik.touched.iuv && Boolean(formik.errors.iuv)}
                  helperText={formik.touched.iuv && formik.errors.iuv}
                  value={formik.values.iuv}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <TextField
                  fullWidth
                  label={
                    isTab1
                      ? t('app.receiptsSearch.fields.fiscalcode')
                      : t('app.receiptsSearch.fields.piva')
                  }
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
                    label={t('app.receiptsSearch.fields.anonymous')}
                  />
                </Box>
              )}
              <Stack alignItems="flex-end">
                <Button size="large" variant="contained" type="submit">
                  {t('app.receiptsSearch.actions.search')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Container>
      <Container sx={{ mb: 4 }}>
        <Stack gap={3}>
          {installmentsMutation.isSuccess && (
            <Typography component="h3" fontWeight={600}>
              {t('app.receiptsSearch.result', { count: installmentsMutation?.data?.length || 0 })}
            </Typography>
          )}
          <Content
            showRetry={installmentsMutation.isError}
            onRetry={() => onSubmit(formik.values)}
            queryKey={['publicInstallmentsByIuvOrNav', brokerId]}
            noDataText={t('app.receiptsSearch.noData.text')}
            noDataTitle={t('app.receiptsSearch.noData.title')}
            noData={installmentsMutation.isSuccess && !installmentsMutation.data?.length}>
            <Results installments={installmentsMutation.data || []} />
          </Content>
        </Stack>
      </Container>
    </Stack>
  );
};
