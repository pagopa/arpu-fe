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

export const DebtPositionsSearch = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabIndex>(TabIndex.PERSONA_FISICA);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    formik.setValues((values) => ({ ...values, fiscalCode: '', anonymous: false }));
    setCurrentTab(newValue);
  };

  const onSubmit = async () => {
    await formik.validateForm();
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
              {t('app.debtPositionsSearch.title')}
            </Typography>
            <Typography variant="body1">{t('app.debtPositionsSearch.description')}</Typography>
          </Stack>
          <form onSubmit={formik.handleSubmit}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label={t('common.person')} />
              <Tab label={t('common.company')} />
            </Tabs>
            <Stack sx={{ backgroundColor: 'background.paper', p: 3, borderRadius: 1, gap: 3 }}>
              <Stack direction="row" gap={3}>
                <TextField
                  fullWidth
                  label={t('fields.iuv')}
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
      </Container>
    </Stack>
  );
};
