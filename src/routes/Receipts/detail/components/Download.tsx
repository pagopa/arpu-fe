import React, { useEffect } from 'react';
import { Link, useLocation, useParams, Location } from 'react-router-dom';
import { Stack, Typography, Button, Link as MuiLink } from '@mui/material';
import { ArcRoutes, ExternalRoutes } from 'routes/routes';
import { Trans, useTranslation } from 'react-i18next';
import loaders from 'utils/loaders';
import storage from 'utils/storage';
import files from 'utils/files';
import notify from 'utils/notify';

export const ReceiptDownload = () => {
  const { t } = useTranslation();

  const brokerId = storage.app.getBrokerId();
  const isAnonymous = storage.user.isAnonymous();

  const location = useLocation() as Location<{ fiscalCode: string }>;
  const fiscalCode = location?.state?.fiscalCode;

  const params = useParams<{ receiptId: string; organizationId: string }>();
  const receiptId = Number(params?.receiptId);
  const organizationId = Number(params?.organizationId);

  const receiptPdf = isAnonymous
    ? loaders.public.usePublicDownloadReceipt({ brokerId })
    : loaders.useDownloadReceipt({ brokerId });

  const onDownload = async () => {
    try {
      const { blob, filename } = await receiptPdf.mutateAsync({
        organizationId,
        receiptId,
        fiscalCode
      });
      files.downloadBlob(blob, filename || `${receiptId}.pdf`);
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
          {t('app.receipts.thankYou.title')}
        </Typography>
        <Typography variant="body1" component="h2">
          <Trans
            i18nKey="app.receipts.thankYou.subtitle"
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
        to={isAnonymous ? ArcRoutes.LOGIN : ArcRoutes.DASHBOARD}>
        {t('actions.close')}
      </Button>
      <Link to={ExternalRoutes.PAYMENT_LINKS} target="_blank">
        {t('app.receipts.thankYou.link')}
      </Link>
    </Stack>
  );
};
