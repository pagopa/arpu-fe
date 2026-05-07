import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import config from 'utils/config';
import { Stack, Card, Button, Divider, Theme, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataRow } from 'components/DataRow';
import { CopiableRow } from 'components/CopiableRow';
import { ArrowBack, Download } from '@mui/icons-material';
import { DateFormat } from 'utils/datetools';
import { usePageTitle } from 'hooks/usePageTitle';
import utils from 'utils';

export const ReceiptDetail = () => {
  // TODO: retrieve brokerId from context when available
  const brokerId = Number(config.brokerId);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const { spacing } = utils.style.theme;
  const isAnonymous = utils.storage.user.isAnonymous();

  const params = useParams<{ receiptId: string; organizationId: string }>();
  const location = useLocation();
  const fiscalCode = location?.state?.fiscalCode;
  const receiptId = Number(params?.receiptId);
  const organizationId = Number(params?.organizationId);

  const request = { brokerId, organizationId, receiptId, fiscalCode };

  const { data } = isAnonymous
    ? utils.loaders.public.usePublicReceiptDetail(request)
    : utils.loaders.useReceiptDetail(request);

  const receiptPdf = isAnonymous
    ? utils.loaders.public.usePublicDownloadReceipt({ brokerId })
    : utils.loaders.useDownloadReceipt({ brokerId });

  const onDownload = () =>
    utils.files.downloadReceipt(receiptPdf.mutateAsync, {
      organizationId,
      receiptId,
      fiscalCode: data?.debtor.fiscalCode
    });

  const onBack = () => {
    navigate(-1);
  };

  const baseTitle = t('pageTitles.paymentReceipt');
  const dynamicTitle = data ? `${baseTitle} ${data.debtPositionTypeOrgDescription}` : baseTitle;

  usePageTitle(dynamicTitle);

  return (
    <>
      <Stack gap={3}>
        <Stack justifyContent="space-between" alignItems="center" direction="row">
          <Stack gap={2}>
            <Typography variant="h4" fontWeight={700}>
              {t('app.receiptDetail.title')}
            </Typography>
            {isAnonymous ? <Typography>{t('app.receiptDetail.subtitle')}</Typography> : null}
          </Stack>
          {isAnonymous ? null : (
            <Button variant="contained" size="large" onClick={onDownload} startIcon={<Download />}>
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
                value={utils.converters.toEuroOrMissingValue(data?.paymentAmountCents)}
              />
              <DataRow
                label={t('app.receiptDetail.remittanceInformation')}
                value={utils.converters.propertyOrMissingValue(data?.remittanceInformation)}
              />
              <DataRow
                label={t('app.receiptDetail.noticeCode')}
                value={utils.converters.propertyOrMissingValue(data?.nav)}
              />
              <DataRow
                label={t('app.receiptDetail.beneficiary')}
                value={utils.converters.propertyOrMissingValue(data?.orgName)}
              />
              <DataRow
                label={t('app.receiptDetail.beneficiaryFiscalCode')}
                value={utils.converters.propertyOrMissingValue(data?.orgFiscalCode)}
              />
              <DataRow
                label={t('app.receiptDetail.debtor')}
                value={utils.converters.propertyOrMissingValue(data?.debtor.fullName)}
              />
              <DataRow
                label={t('app.receiptDetail.debtorFiscalCode')}
                value={utils.converters.propertyOrMissingValue(data?.debtor.fiscalCode)}
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
            value={utils.converters.propertyOrMissingValue(data?.pspCompanyName)}
          />
          <Divider />
          <CopiableRow
            label={t('app.receiptDetail.paymentDate')}
            value={utils.converters.formatDateOrMissingValue(data?.paymentDateTime, {
              format: DateFormat.LONG,
              withTime: true,
              second: '2-digit'
            })}
          />
          <Divider />
          <CopiableRow
            label={t('app.receiptDetail.iur')}
            value={utils.converters.propertyOrMissingValue(data?.iur)}
            copiable
          />
          <Divider />
          <CopiableRow
            label={t('app.receiptDetail.iud')}
            value={utils.converters.propertyOrMissingValue(data?.iud)}
            copiable
          />
        </Card>
        {isAnonymous ? (
          <Stack direction="row" justifyContent={'space-between'}>
            <Button size="large" variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
              {t('app.routes.back')}
            </Button>
            <Button variant="contained" size="large" onClick={onDownload} startIcon={<Download />}>
              {t('app.receiptDetail.download')}
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </>
  );
};
