import React, { useEffect } from 'react';
import { Link, useLocation, useParams, Location } from 'react-router-dom';
import { Stack, Typography, Button, Link as MuiLink } from '@mui/material';
import { ROUTES, ExternalRoutes } from 'routes/routes';
import { Trans, useTranslation } from 'react-i18next';
import loaders from 'utils/loaders';
import storage from 'utils/storage';
import files from 'utils/files';
import notify from 'utils/notify';

export const DebtPositionDownload = () => {
  const { t } = useTranslation();

  const brokerId = storage.app.getBrokerId();
  const isAnonymous = storage.user.isAnonymous();

  const location = useLocation() as Location<{ fiscalCode: string }>;
  const fiscalCode = location?.state?.fiscalCode;

  const params = useParams<{ iuv: string; organizationId: string }>();
  const iuv = params?.iuv;
  const organizationId = Number(params?.organizationId);

  if (isNaN(organizationId) || !iuv || !brokerId || !fiscalCode) {
    throw new Error('Missing required parameters');
  }

  const noticeLoader = isAnonymous
    ? loaders.public.getPublicPaymentNotice
    : loaders.getPaymentNotice;

  const paymentNotice = noticeLoader(brokerId, organizationId, { iuv }, fiscalCode);

  const onDownload = async () => {
    try {
      const { data, filename } = await paymentNotice.mutateAsync();
      files.downloadBlob(data, filename || `${iuv}.pdf`);
    } catch {
      notify.emit(t('app.receiptDetail.downloadError'));
    }
  };

  useEffect(() => {
    onDownload();
  }, []);

  return (
    <Stack gap={4} padding={25} alignItems="center" justifyContent="center">
      <img src="/cittadini/pictograms/hourglass.svg" aria-hidden="true" height={60} width={60} />
      <Stack gap={1} alignItems="center">
        <Typography variant="h4" component="h1" fontWeight={600}>
          {t('app.debtPositions.download.title')}
        </Typography>
        <Typography variant="body1" component="h2">
          <Trans
            i18nKey="app.debtPositions.download.subtitle"
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
        to={isAnonymous ? ROUTES.LOGIN : ROUTES.DASHBOARD}>
        {t('actions.close')}
      </Button>
      <Link to={ExternalRoutes.PAYMENT_LINKS} target="_blank">
        {t('app.debtPositions.download.link')}
      </Link>
    </Stack>
  );
};
