import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import QueryLoader from 'components/QueryLoader';
import { TransactionListSkeleton } from 'components/Skeleton';
import utils from 'utils';
import { Helmet } from 'react-helmet';
import config from 'utils/config';
import { useSearch } from 'hooks/useSearch';
import { ReceiptDataGrid } from './ReceiptDataGrid';
import { NoData } from '../../../components/NoData';
import { Retry } from 'components/Retry';
import { ArcRoutes } from 'routes/routes';
import { Link } from 'react-router-dom';

export const ReceiptsList = () => {
  const { t } = useTranslation();
  // TODO: retrieve brokerId from context when available
  const brokerId = Number(config.brokerId);

  const mutation = utils.loaders.getPagedDebtorReceipts(brokerId);

  const { query, applyFilters } = useSearch({
    query: mutation,
    filters: {
      sort: ['paymentDateTime,desc']
    }
  });

  if (query.isError) return <Retry action={() => applyFilters()} />;

  return (
    <>
      <Helmet>
        <title>{`${t('pageTitles.notices')} - ${t('app.title')} `}</title>
      </Helmet>
      <Stack gap={3}>
        <Stack gap={1}>
          <Typography variant="h3">{t('menu.receipts.pageTitle')}</Typography>

          <Typography fontSize={16}>
            {t('app.receipts.subtitle')}{' '}
            <Link to={ArcRoutes.public.RECEIPTS_SEARCH}>{t('app.receipts.subtitleLink')}</Link>
          </Typography>
        </Stack>

        <QueryLoader loaderComponent={<TransactionListSkeleton />} loading={query.isPending}>
          {query?.data?.content?.length ? (
            <ReceiptDataGrid data={query.data} />
          ) : (
            <NoData title={t('app.receipts.empty.title')} text={t('app.receipts.empty.subtitle')} />
          )}
        </QueryLoader>
      </Stack>
    </>
  );
};
