import { Button, Container, Link as MuiLink, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IllusHourGlass from './IllusHourGlass';
import utils from 'utils';
import { Link, useLocation, useParams } from 'react-router-dom';
import storage from 'utils/storage';
import { useAppRoutes } from 'hooks/useAppRoutes';
import { useRecaptcha } from 'components/RecaptchaProvider/RecaptchaProvider';
import queryString from 'query-string';

const Download = () => {
  const { routes, externalRoutes } = useAppRoutes();
  const { t } = useTranslation();
  const { orgId, nav } = useParams();
  const brokerId = storage.app.getBrokerId();

  const location = useLocation();
  const { debtorFiscalCode } = queryString.parse(location.hash);

  if (!orgId || !nav || !brokerId) {
    throw new Error('Missing required parameters');
  }

  const parsedOrgId = parseInt(orgId, 10);

  const mutation = utils.loaders.getPaymentNotice(brokerId, parsedOrgId, { nav });

  const anonymousMutation = utils.loaders.public.getPublicPaymentNotice(
    brokerId,
    parsedOrgId,
    { nav },
    (debtorFiscalCode as string) || ''
  );

  const isAnonymous = utils.storage.user.isAnonymous();

  const { executeRecaptcha } = useRecaptcha();

  const download = async () => {
    try {
      if (isAnonymous) {
        const recaptchaToken = await executeRecaptcha();
        const { data, filename } = await anonymousMutation.mutateAsync({ recaptchaToken });
        if (!data || (data instanceof Blob && data.size === 0)) {
          utils.notify.emit(t('spontanei.download.error'));
          return;
        }
        utils.files.downloadBlob(data, filename || `${nav}.pdf`);
        return;
      }
      const { data, filename } = await mutation.mutateAsync();
      if (!data || (data instanceof Blob && data.size === 0)) {
        utils.notify.emit(t('spontanei.download.error'));
        return;
      }
      utils.files.downloadBlob(data, filename || `${nav}.pdf`);
    } catch {
      utils.notify.emit('qualcosa è andato storto');
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
                link1: <MuiLink onClick={download} fontWeight={800} />
              }}
            />
          </Typography>
        </Stack>
        <Button
          component={'a'}
          href={isAnonymous ? routes.LOGIN : routes.DASHBOARD}
          variant="contained"
          size="large">
          {t('spontanei.download.close')}
        </Button>
        <Button component={Link} to={externalRoutes.PAYMENT_LINKS} target="_blank">
          {t('spontanei.download.info')}
        </Button>
      </Stack>
    </Container>
  );
};

export default Download;
