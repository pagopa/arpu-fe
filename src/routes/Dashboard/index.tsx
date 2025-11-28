import React, { useEffect } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { ArcRoutes } from '../routes';
import { grey } from '@mui/material/colors';
import QueryLoader from 'components/QueryLoader';
import { TransactionListSkeleton } from 'components/Skeleton';
import PaymentButton from 'components/PaymentButton';
import { useUserInfo } from 'hooks/useUserInfo';
import { Helmet } from 'react-helmet';
import { resetCart } from 'store/CartStore';
import { Retry } from 'components/Retry';
import { NoData } from 'components/NoData/NoData';
import { ReceiptsPreview } from 'routes/Receipts/components/ReceiptsPreview';
import { useSearch } from 'hooks/useSearch';
import utils from 'utils';

const Dashboard = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const query = utils.loaders.getPagedDebtorReceipts(brokerId);

  const filters = {
    sort: ['paymentDateTime,desc'],
    size: 3,
    page: 0
  };

  const {
    query: { data, isError },
    applyFilters
  } = useSearch({
    query,
    filters
  });

  const theme = useTheme();
  const { userInfo } = useUserInfo();
  const [searchParams, setSearchParams] = useSearchParams();

  const Content = () => {
    if (isError || !data?.content) return <Retry action={() => applyFilters(filters)} />;

    if (data?.content?.length === 0)
      return (
        <NoData title={t('app.receipts.empty.title')} text={t('app.receipts.empty.subtitle')} />
      );

    return <ReceiptsPreview rows={data?.content} hideDateOrdering />;
  };

  useEffect(() => {
    const action = searchParams.get('fromAction');
    if (action === 'payment-success') {
      resetCart();
      setSearchParams({}, { replace: true });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{`${t('pageTitles.dashboard')} - ${t('app.title')} `}</title>
      </Helmet>
      <Stack
        flex={1}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={'space-between'}
        alignItems={{ sm: 'center' }}
        gap={3}
        mb={5}>
        <Typography
          variant="h3"
          aria-label={t('app.dashboard.greeting')}
          sx={{ textTransform: 'capitalize' }}>
          {userInfo?.name &&
            t('app.dashboard.title', {
              username: userInfo.name
            })}
        </Typography>
        <PaymentButton />
      </Stack>
      <Stack gap={5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={{ xs: 2, sm: 3 }}>
          <Typography variant="h6" component="h2" marginInlineStart={1}>
            {t('app.dashboard.lastTransactions')}
          </Typography>
          {data?.content?.length && data.content.length > 0 ? (
            <Button
              component={Link}
              to={ArcRoutes.RECEIPTS}
              sx={{
                width: theme.spacing(10),
                justifyContent: 'flex-start',
                p: 0
              }}>
              {t('app.dashboard.seeAllTransactions')}
            </Button>
          ) : null}
        </Stack>
      </Stack>
      <Box
        bgcolor={grey['A200']}
        padding={{ xs: 3, md: 2 }}
        margin={{ xs: -3, md: 0 }}
        marginTop={{ xs: 0, sm: 1 }}>
        <QueryLoader queryKey="noticesList" loaderComponent={<TransactionListSkeleton />}>
          <Content />
        </QueryLoader>
      </Box>
    </>
  );
};

export default Dashboard;
