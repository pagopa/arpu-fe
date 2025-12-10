import { Button, Card, Divider, Stack, Typography } from '@mui/material';
import { CopiableRow } from 'components/CopiableRow';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import utils from 'utils';
import { propertyOrMissingValue } from 'utils/converters';

const DebtPositionDetail = () => {
  const brokerId = utils.storage.app.getBrokerId();
  const { t } = useTranslation();
  const { debtPositionId } = useParams();

  if (!debtPositionId || isNaN(Number(debtPositionId))) {
    throw new Error('debtPositionId is required and must be a number');
  }

  const data = utils.loaders.getDebtPositionDetail(brokerId, Number(debtPositionId));

  return (
    <>
      <Typography variant="h4" component="h1" marginInlineStart={1} mb={2}>
        {data.data?.description || t('debtPositionDetail.title')}
      </Typography>
      <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {t('app.debtPositionDetail.paymentData')}
        </Typography>
        <CopiableRow
          label={t('app.debtPositionDetail.org')}
          value={propertyOrMissingValue('missing org name')}
        />
        <Divider />
        <CopiableRow
          label={t('app.debtPositionDetail.cf')}
          value={propertyOrMissingValue('missing cf')}
          copiable
        />
        <Divider />
        <CopiableRow
          label={t('app.debtPositionDetail.iupd')}
          value={propertyOrMissingValue(data?.data?.iupdOrg)}
          copiable
        />
      </Card>
      <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column', marginTop: 2 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {t('app.debtPositionDetail.paymentOptions')}
        </Typography>
        <pre>{JSON.stringify(data.data?.paymentOptions, null, 2)}</pre>
        <Stack direction="row" spacing={2} marginTop={2} justifyContent="flex-end">
          <Button variant="outlined" size="large">
            {t('app.debtPositionDetail.addToCart')}
          </Button>
          <Button variant="contained" size="large">
            {t('app.debtPositionDetail.pay')}
          </Button>
        </Stack>
      </Card>
    </>
  );
};

export default DebtPositionDetail;
