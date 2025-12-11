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
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { useTranslation } from 'react-i18next';
import { BackButton } from 'components/BackButton';

enum TabIndex {
  PERSONA_FISICA = 0,
  PERSONA_GIURIDICA = 1
}

const initialValues = {
  iuv: '',
  fiscalCode: '',
  piva: '',
  anonymous: false
};

interface FormValues {
  iuv: string;
  fiscalCode?: string;
  anonymous?: boolean;
  piva?: string;
}

export const ReceiptsSearch = () => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState<TabIndex>(TabIndex.PERSONA_FISICA);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabIndex) => {
    setCurrentTab(newValue);
  };

  const onSubmit = (values: FormValues) => {
    console.debug(currentTab, JSON.stringify(values));
  };

  const isTab1 = currentTab === TabIndex.PERSONA_FISICA;

  const validationSchema = toFormikValidationSchema(
    z.object({
      iuv: z.number(),
      fiscalCode: z.string(),
      piva: z.string(),
      anonymous: z.boolean()
    })
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
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
                {t(
                  currentTab === TabIndex.PERSONA_FISICA
                    ? 'app.receiptsSearch.tab1.description'
                    : 'app.receiptsSearch.tab2.description'
                )}
              </Typography>
              <Stack direction="row" gap={3}>
                <TextField
                  fullWidth
                  label={t('app.receiptsSearch.fields.iuv')}
                  id="iuv"
                  error={formik.touched.iuv && !!formik.errors.iuv}
                  helperText={formik.touched.iuv && formik.errors.iuv}
                  value={formik.values.iuv}
                  onChange={formik.handleChange}
                />

                {isTab1 ? (
                  <TextField
                    fullWidth
                    label={t('app.receiptsSearch.fields.fiscalcode')}
                    id="fiscalCode"
                    key="fiscalCode"
                    disabled={formik.values.anonymous}
                    error={
                      !!formik.values.fiscalCode &&
                      !!formik.errors.fiscalCode &&
                      !formik.values.anonymous
                    }
                    helperText={
                      formik.touched.fiscalCode &&
                      formik.errors.fiscalCode &&
                      !formik.values.anonymous
                    }
                    value={formik.values.anonymous ? '' : formik.values.fiscalCode}
                    onChange={formik.handleChange}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={t('app.receiptsSearch.fields.piva')}
                    id="piva"
                    key="piva"
                    error={formik.touched.piva && !!formik.errors.piva}
                    helperText={formik.touched.piva && formik.errors.piva}
                    onChange={formik.handleChange}
                  />
                )}
              </Stack>
              {currentTab === TabIndex.PERSONA_FISICA && (
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.anonymous}
                        onChange={formik.handleChange}
                        id="anonymous"
                      />
                    }
                    label={t('app.receiptsSearch.fields.anonymous')}
                  />
                </Box>
              )}
              <Stack alignItems="flex-end">
                <Button
                  size="large"
                  variant="contained"
                  type="submit"
                  className="submit-btn"
                  disabled>
                  {t('app.receiptsSearch.action')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Stack>
  );
};
