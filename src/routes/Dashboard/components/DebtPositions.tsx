import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useSearch } from 'hooks/useSearch';
import utils from 'utils';
import { Content } from 'components/Content';
import { DebtPositionItem } from 'routes/DebtPositions/components/item';
import { useTranslation } from 'react-i18next';

export const DebtPositions = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const debtPositionsQuery = utils.loaders.usePagedUnpaidDebtPositions(brokerId);

  const debtPositionsFilters = {
    sort: [],
    size: 3,
    page: 0
  };

  const debtPositions = useSearch({
    query: debtPositionsQuery,
    filters: debtPositionsFilters
  });

  return (
    <Stack gap={2}>
      <Typography variant="h6" component="h2" marginInlineStart={1}>
        {t('app.dashboard.lastDebtPositions')}
      </Typography>
      <Content
        showRetry={debtPositions.query.isError}
        noData={!debtPositions.query.data?.content?.length}
        onRetry={() => debtPositions.applyFilters(debtPositionsFilters)}
        queryKey="pagedUnpaidDebtPositions"
        noDataTitle={t('app.debtPositions.empty.title')}
        noDataText={t('app.debtPositions.empty.subtitle')}>
        <Stack gap={2}>
          {debtPositions.query.data?.content?.map((debtPosition) => (
            <DebtPositionItem key={debtPosition.debtPositionId} debtPosition={debtPosition} />
          ))}
        </Stack>
      </Content>
    </Stack>
  );
};
