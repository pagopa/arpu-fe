import React from 'react';
import { generatePath, Location, useLocation, useNavigate, useParams } from 'react-router-dom';
import config from 'utils/config';
import {
  Stack,
  Card,
  colors,
  Button,
  Divider,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataRow } from 'components/DataRow';
import { CopiableRow } from 'components/CopiableRow';
import {
  formatDateOrMissingValue,
  propertyOrMissingValue,
  toEuroOrMissingValue
} from 'utils/converters';
import loaders from 'utils/loaders';
import utils from 'utils';
import { ArrowBack, Download } from '@mui/icons-material';
import { DateFormat } from 'utils/datetools';
import { ArcRoutes } from 'routes/routes';
import { Helmet } from 'react-helmet';

export const ReceiptDetail = () => {
  // TODO: retrieve brokerId from context when available
  const brokerId = Number(config.brokerId);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const { spacing } = utils.style.theme;
  const isAnonymous = utils.storage.user.isAnonymous();

  const params = useParams<{ receiptId: string; organizationId: string }>();
  const location = useLocation() as Location<{ fiscalCode: string }>;
  const fiscalCode = location?.state?.fiscalCode;
  const receiptId = Number(params?.receiptId);
  const organizationId = Number(params?.organizationId);

  const request = { brokerId, organizationId, receiptId, fiscalCode };
  const { data } = isAnonymous
    ? loaders.public.usePublicReceiptDetail(request)
    : loaders.useReceiptDetail(request);

  const onDownload = () => {
    const path = isAnonymous ? ArcRoutes.public.RECEIPT_DOWNLOAD : ArcRoutes.RECEIPT_DOWNLOAD;

    navigate(generatePath(path, { receiptId, organizationId }), { state: { fiscalCode } });
  };

  const onBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>{`${data?.debtPositionTypeOrgDescription || t('pageTitles.receiptDetail')} - ${t('app.title')}`}</title>
      </Helmet>
      <Stack alignItems="center" p={3} bgcolor={colors.grey['100']}>
        <Stack gap={3} width={{ xs: '100%', md: isAnonymous ? '70%' : '100%' }}>
          <Stack justifyContent="space-between" alignItems="center" direction="row">
            <Stack gap={2}>
              <Typography variant="h4" fontWeight={700}>
                {t('app.receiptDetail.title')}
              </Typography>
              {isAnonymous ? <Typography>{t('app.receiptDetail.subtitle')}</Typography> : null}
            </Stack>
            {isAnonymous ? null : (
              <Button
                variant="contained"
                size="large"
                onClick={onDownload}
                startIcon={<Download />}>
                {t('app.receiptDetail.download')}
              </Button>
            )}
          </Stack>
          <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700}>
              {data?.debtPositionTypeOrgDescription}
            </Typography>
            <table style={{ width: mdUp ? '50%' : '100%', borderSpacing: spacing(2) }}>
              <tbody>
                <DataRow
                  label={t('app.receiptDetail.amount')}
                  value={toEuroOrMissingValue(data?.paymentAmountCents)}
                />
                <DataRow
                  label={t('app.receiptDetail.remittanceInformation')}
                  value={propertyOrMissingValue(data?.remittanceInformation)}
                />
                <DataRow
                  label={t('app.receiptDetail.noticeCode')}
                  value={propertyOrMissingValue(data?.nav)}
                />
                <DataRow
                  label={t('app.receiptDetail.beneficiary')}
                  value={propertyOrMissingValue(data?.orgName)}
                />
                <DataRow
                  label={t('app.receiptDetail.beneficiaryFiscalCode')}
                  value={propertyOrMissingValue(data?.orgFiscalCode)}
                />
                <DataRow
                  label={t('app.receiptDetail.debtor')}
                  value={propertyOrMissingValue(data?.debtor.fullName)}
                />
                <DataRow
                  label={t('app.receiptDetail.debtorFiscalCode')}
                  value={propertyOrMissingValue(data?.debtor.fiscalCode)}
                />
              </tbody>
            </table>
          </Card>
          <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {t('app.receiptDetail.paymentInformation')}
            </Typography>
            <CopiableRow
              label={t('app.receiptDetail.psp')}
              value={propertyOrMissingValue(data?.pspCompanyName)}
            />
            <Divider />
            <CopiableRow
              label={t('app.receiptDetail.paymentDate')}
              value={formatDateOrMissingValue(data?.paymentDateTime, {
                format: DateFormat.LONG,
                withTime: true,
                second: '2-digit'
              })}
            />
            <Divider />
            <CopiableRow
              label={t('app.receiptDetail.iur')}
              value={propertyOrMissingValue(data?.iur)}
              copiable
            />
            <Divider />
            <CopiableRow
              label={t('app.receiptDetail.iud')}
              value={propertyOrMissingValue(data?.iud)}
              copiable
            />
          </Card>
          {isAnonymous ? (
            <Stack direction="row" justifyContent={'space-between'}>
              <Button size="large" variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
                {t('app.routes.back')}
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={onDownload}
                startIcon={<Download />}>
                {t('app.receiptDetail.download')}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </>
  );
};
