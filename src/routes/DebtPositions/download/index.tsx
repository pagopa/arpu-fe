import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Stack, Typography, Button, Link as MuiLink } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import loaders from 'utils/loaders';
import storage from 'utils/storage';
import files from 'utils/files';
import notify from 'utils/notify';
import { useAppRoutes } from 'hooks/useAppRoutes';
import { useRecaptcha } from 'components/RecaptchaProvider/RecaptchaProvider';
import queryString from 'query-string';

export const DebtPositionDownload = () => {
  const { t } = useTranslation();
  const { routes, externalRoutes } = useAppRoutes();

  const brokerId = storage.app.getBrokerId();
  const isAnonymous = storage.user.isAnonymous();

  const location = useLocation();
  const { debtorFiscalCode } = queryString.parse(location.hash);

  const params = useParams();
  const nav = params?.nav;
  const organizationId = Number(params?.orgId);

  if (isNaN(organizationId) || !nav || !brokerId || !debtorFiscalCode) {
    throw new Error('Missing required parameters');
  }

  const { executeRecaptcha } = useRecaptcha();

  const anonymousPaymentNotice = loaders.public.getPublicPaymentNotice(
    brokerId,
    organizationId,
    { nav },
    debtorFiscalCode as string
  );

  const paymentNotice = loaders.getPaymentNotice(
    brokerId,
    organizationId,
    { nav },
    debtorFiscalCode as string
  );

  const onDownload = async () => {
    try {
      if (isAnonymous) {
        const recaptchaToken = await executeRecaptcha();
        const { data, filename } = await anonymousPaymentNotice.mutateAsync({ recaptchaToken });
        files.downloadBlob(data, filename || `${nav}.pdf`);
      } else {
        const { data, filename } = await paymentNotice.mutateAsync();
        files.downloadBlob(data, filename || `${nav}.pdf`);
      }
    } catch {
      notify.emit(t('errors.toast.file'));
    }
  };

  useEffect(() => {
    onDownload();
  }, []);

  return (
    <Stack gap={4} padding={25} alignItems="center" justifyContent="center">
      <img src="/cittadini/pictograms/hourglass.svg" aria-hidden="true" height={60} width={60} />
      <Stack gap={1} alignItems="center" textAlign="center" maxWidth={(theme) => theme.spacing(48)}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          {t('app.debtPositions.download.title')}
        </Typography>
        <Typography variant="body1" component="p">
          <Trans
            i18nKey="app.debtPositions.download.help"
            components={{
              CustomLink: <MuiLink onClick={onDownload} sx={{ cursor: 'pointer' }} />
            }}
          />
        </Typography>
        <Typography variant="body1" component="p">
          <Trans
            i18nKey="app.debtPositions.download.info"
            components={{
              CustomLink: <MuiLink onClick={onDownload} sx={{ cursor: 'pointer' }} />
            }}
          />
        </Typography>
      </Stack>
      <Button
        variant="contained"
        size="large"
        component={Link}
        to={isAnonymous ? routes.LOGIN : routes.DASHBOARD}>
        {t('actions.close')}
      </Button>
      <Link to={externalRoutes.PAYMENT_LINKS} target="_blank">
        {t('app.debtPositions.download.link')}
      </Link>
    </Stack>
  );
};
