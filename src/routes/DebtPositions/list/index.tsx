import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Content } from 'components/Content';
import { DebtPositionItem } from '../components/item';
import { useSearch } from 'hooks/useSearch';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import CustomPagination from 'components/DataGrid/CustomPagination';
import PaymentButton from 'components/PaymentButton';

export const DebtPositionsList = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const debtPositionsQuery = utils.loaders.usePagedUnpaidDebtPositions(brokerId);

  const debtPositionsFilters = {
    sort: [],
    page: 0
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
      <Typography variant="h4" component="h1" marginInlineStart={1}>
        {t('app.debtPositions.list.title')}
      </Typography>
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
