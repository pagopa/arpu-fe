import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReceiptsPreview } from 'routes/Receipts/components/ReceiptsPreview';
import { Content } from 'components/Content';
import { ArcRoutes } from 'routes/routes';
import { useSearch } from 'hooks/useSearch';
import { useTranslation } from 'react-i18next';
import utils from 'utils';

export const Receipts = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const receiptsQuery = utils.loaders.getPagedDebtorReceipts(brokerId);

  const receiptsfilters = {
    sort: ['paymentDateTime,desc'],
    size: 3,
    page: 0
  };

  const receipts = useSearch({
    query: receiptsQuery,
    filters: receiptsfilters
  });

  return (
    <Stack gap={2}>
      <Stack gap={3} direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" component="h2" marginInlineStart={1}>
          {t('app.dashboard.lastTransactions')}
        </Typography>
        {receipts.query.data?.content?.length ? (
          <Button component={Link} to={ArcRoutes.RECEIPTS}>
            {t('app.dashboard.seeAllTransactions')}
          </Button>
        ) : null}
      </Stack>
      <Content
        showRetry={receipts.query.isError}
        noData={!receipts.query.data?.content?.length}
        onRetry={() => receipts.applyFilters(receiptsfilters)}
        queryKey="pagedDebtorReceipts"
        noDataTitle={t('app.receipts.empty.title')}
        noDataText={t('app.receipts.empty.subtitle')}>
        <ReceiptsPreview rows={receipts.query.data?.content} hideDateOrdering />
      </Content>
    </Stack>
  );
};
