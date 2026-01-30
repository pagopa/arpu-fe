import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Content } from 'components/Content';
import { DebtPositionItem } from '../components/item';
import { useSearch } from 'hooks/useSearch';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import CustomPagination from 'components/DataGrid/CustomPagination';
import PaymentButton from 'components/PaymentButton';
import { ArcRoutes } from 'routes/routes';
import { Link } from 'react-router-dom';

export const DebtPositionsList = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const debtPositionsQuery = utils.loaders.usePagedUnpaidDebtPositions(brokerId);

  const debtPositionsFilters = {
    sort: []
  };

  const {
    query: { isError, isSuccess, data },
    applyFilters
  } = useSearch({
    query: debtPositionsQuery,
    filters: debtPositionsFilters
  });

  return (
    <Stack gap={3}>
      <Stack gap={1}>
        <Typography variant="h3">{t('app.debtPositions.list.title')}</Typography>
        <Typography fontSize={16}>
          {t('app.debtPositions.list.subtitle')}{' '}
          <Link to={ArcRoutes.public.DEBT_POSITION_SEARCH}>
            {t('app.debtPositions.list.subtitleLink')}
          </Link>
        </Typography>
      </Stack>
      <Content
        showRetry={isError}
        noData={isSuccess && !data?.content?.length}
        onRetry={() => applyFilters(debtPositionsFilters)}
        noDataCta={<PaymentButton />}
        queryKey="pagedUnpaidDebtPositions"
        noDataTitle={t('app.debtPositions.empty.title')}
        noDataText={t('app.debtPositions.empty.subtitle')}>
        <Stack gap={2}>
          {data?.content?.map((debtPosition) => (
            <DebtPositionItem key={debtPosition.debtPositionId} debtPosition={debtPosition} />
          ))}
        </Stack>
      </Content>
      {data?.totalPages && data.totalPages > 0 ? (
        <CustomPagination totalPages={data?.totalPages ?? 1} />
      ) : null}
    </Stack>
  );
};
