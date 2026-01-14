import React from 'react';
import { DebtorUnpaidDebtPositionDTO } from '../../../../generated/data-contracts';
import { ChevronRight } from '@mui/icons-material';
import { Stack, Typography, IconButton, Card, Theme, useMediaQuery, Divider } from '@mui/material';
import { PayeeIcon } from 'components/PayeeIcon';
import { generatePath, Link, useNavigate } from 'react-router-dom';
import {
  fromTaxCodeToSrcImage,
  formatDateOrMissingValue,
  toEuroOrMissingValue
} from 'utils/converters';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import { ArcRoutes } from 'routes/routes';

type DebtPositionItemProps = {
  debtPosition: DebtorUnpaidDebtPositionDTO;
};

export const DebtPositionItem = ({ debtPosition }: DebtPositionItemProps) => {
  const sm = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  const {
    orgName,
    orgFiscalCode,
    debtPositionId,
    paymentOptions,
    debtPositionTypeOrgDescription,
    organizationId
  } = debtPosition;

  const detailPath = generatePath(ArcRoutes.DEBT_POSITION, { debtPositionId, organizationId });

  return (
    <Card onClick={() => navigate(detailPath)}>
      <Stack p={3} direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={{ xs: 0, sm: 2 }} alignItems="center">
          <PayeeIcon src={fromTaxCodeToSrcImage(orgFiscalCode)} alt={orgName} visible={smUp} />
          <Stack maxWidth="30vw">
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
              {orgName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
              {debtPositionTypeOrgDescription}
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" gap={2}>
          <Divider orientation="vertical" flexItem />
          <Stack gap={2}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                {t('app.debtPositions.debtPositionItem.amount')}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}>
                {toEuroOrMissingValue(paymentOptions[0]?.totalAmountCents)}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                {t('app.debtPositions.debtPositionItem.dueDate')}
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}>
                {formatDateOrMissingValue(paymentOptions[0]?.dueDate)}
              </Typography>
            </Stack>
          </Stack>
          {sm && (
            <Link
              to={detailPath}
              aria-label={t('commons.detail')}
              data-testid="receipt-details-button">
              <IconButton size="small">
                <ChevronRight />
              </IconButton>
            </Link>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
