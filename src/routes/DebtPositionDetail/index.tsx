import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import { CopiableRow } from 'components/CopiableRow';
import { PayeeIcon } from 'components/PayeeIcon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import utils from 'utils';
import { fromTaxCodeToSrcImage, propertyOrMissingValue } from 'utils/converters';
import PaymentOptionWrapper from './components/PaymentOptions';
import {
  DebtorPaymentOptionOverviewDTO,
  InstallmentStatus,
  PaymentOptionType
} from '../../../generated/data-contracts';
import { PaidOptionReceipt } from './components/PaidOptionReceipt';
import { usePageTitle } from 'hooks/usePageTitle';

const DebtPositionDetail = () => {
  const brokerId = utils.storage.app.getBrokerId();
  const { t } = useTranslation();
  const { debtPositionId, organizationId } = useParams();

  const { data } = utils.loaders.getDebtPositionDetail(
    brokerId,
    Number(debtPositionId),
    Number(organizationId)
  );

  if (!debtPositionId || isNaN(Number(debtPositionId))) {
    throw new Error('debtPositionId is required and must be a number');
  }

  if (!organizationId || isNaN(Number(organizationId))) {
    throw new Error('organizationId is required and must be a number');
  }

  const baseTitle = t('pageTitles.debtPositionDetail');
  const dynamicTitle = data ? `${baseTitle} ${data.debtPositionTypeOrgDescription}` : baseTitle;

  usePageTitle(dynamicTitle);

  if (!data) {
    return <div>Loading...</div>; //TODO: we have to subsitite this with a spinner or a skeleton
  }

  const orgInfo = {
    orgName: data.orgName,
    orgId: data.orgFiscalCode
  };

  const paidOptions = data.paymentOptions.reduce(
    (acc: DebtorPaymentOptionOverviewDTO[], paymentOption: DebtorPaymentOptionOverviewDTO) => {
      const { paymentOptionType, installments } = paymentOption;
      if (
        paymentOptionType == PaymentOptionType.INSTALLMENTS &&
        installments.some(({ status }) => status === InstallmentStatus.PAID)
      ) {
        return [...acc, paymentOption];
      }
      return acc;
    },
    []
  );

  return (
    <>
      <Stack gap={3}>
        <Typography
          variant="h4"
          component="h1"
          marginInlineStart={1}
          data-testid="debt-position-detail-title">
          {data.debtPositionTypeOrgDescription || t('debtPositionDetail.title')}
        </Typography>
        <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body1" component="h2" fontWeight="600" fontStyle="semibold">
            {t('app.debtPositionDetail.paymentData')}
          </Typography>
          <Stack direction="row" gap={2} data-testid="debt-position-detail-org-name">
            <PayeeIcon src={fromTaxCodeToSrcImage(data.orgFiscalCode)} alt={data.orgName} visible />
            <CopiableRow
              label={t('app.debtPositionDetail.org')}
              value={propertyOrMissingValue(data.orgName)}
            />
          </Stack>
          <Divider />
          <Box data-testid="debt-position-detail-org-code">
            <CopiableRow
              label={t('app.debtPositionDetail.cf')}
              value={propertyOrMissingValue(data.orgFiscalCode)}
              copiable
            />
          </Box>
          <Divider />
          <Box data-testid="debt-position-detail-iupd">
            <CopiableRow
              label={t('app.debtPositionDetail.iupd')}
              value={propertyOrMissingValue(data.iupd)}
              copiable
            />
          </Box>
        </Card>
        <PaymentOptionWrapper
          paymentOptions={data.paymentOptions}
          orgInfo={orgInfo}
          debtPositionId={Number(debtPositionId)}
        />
        {!!paidOptions?.length && (
          <Card sx={{ padding: 3, gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1" component="h2" fontWeight="600" fontStyle="semibold">
              {t('app.debtPositionDetail.receipts')}
            </Typography>
            {paidOptions.map((option) => (
              <PaidOptionReceipt key={option.paymentOptionId} paymentOption={option} />
            ))}
          </Card>
        )}
      </Stack>
    </>
  );
};

export default DebtPositionDetail;
