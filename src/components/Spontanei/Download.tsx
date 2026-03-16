import { Button, Container, Link, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IllusHourGlass from './IllusHourGlass';
import utils from 'utils';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from 'routes/routes';
import storage from 'utils/storage';

const Download = () => {
  const { t } = useTranslation();
  const { orgId, nav } = useParams();
  const brokerId = storage.app.getBrokerId();

  const navigate = useNavigate();
  const location = useLocation();

  if (!orgId || !nav || !brokerId) {
    throw new Error('Missing required parameters');
  }

  const parsedOrgId = parseInt(orgId, 10);

  const mutation = utils.loaders.getPaymentNotice(brokerId, parsedOrgId, { nav });

  const anonymousMutation = utils.loaders.public.getPublicPaymentNotice(
    brokerId,
    parsedOrgId,
    { nav },
    location.state?.debtorFiscalCode || ''
  );

  const isAnonymous = utils.storage.user.isAnonymous();

  const download = async () => {
    try {
      if (isAnonymous) {
        const { data, filename } = await anonymousMutation.mutateAsync();
        utils.files.downloadBlob(data, filename || `${nav}.pdf`);
        return;
      }
      const { data, filename } = await mutation.mutateAsync();
      utils.files.downloadBlob(data, filename || `${nav}.pdf`);
    } catch {
      utils.notify.emit('qualcosa è andato storto');
    }
  };

  const close = () => {
    if (isAnonymous) {
      navigate(ROUTES.LOGIN);
    } else {
      navigate(ROUTES.DASHBOARD);
    }
  };

  useEffect(() => {
    download();
  }, []);

  return (
    <Container>
      <Stack alignItems="center" mt={22.5} mb={22.5} gap={4}>
        <IllusHourGlass />
        <Stack alignItems="center">
          <Typography variant="h4">{t('spontanei.download.title')}</Typography>
          <Typography variant="body1" style={{ cursor: 'pointer' }}>
            <Trans
              i18nKey={t('spontanei.download.help')}
              components={{
                link1: <Link onClick={download} fontWeight={800} />
              }}
            />
          </Typography>
        </Stack>
        <Button variant="contained" size="large" onClick={close}>
          {t('spontanei.download.close')}
        </Button>
        <Button href="https://www.pagopa.gov.it/it/cittadini/dove-pagare/" target="_blank">
          {t('spontanei.download.info')}
        </Button>
      </Stack>
    </Container>
  );
};

export default Download;
