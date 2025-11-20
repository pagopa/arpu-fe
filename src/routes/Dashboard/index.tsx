import React, { useEffect } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import utils from 'utils';
import { ArcRoutes } from '../routes';
import { grey } from '@mui/material/colors';
import QueryLoader from 'components/QueryLoader';
import { PaymentNotice } from 'components/PaymentNotice';
import { TransactionListSkeleton } from 'components/Skeleton';
import PaymentButton from 'components/PaymentButton';
import { Empty, Retry, TransactionsList } from 'components/Transactions';
import { useUserInfo } from 'hooks/useUserInfo';
import { Helmet } from 'react-helmet';
import { resetCart } from 'store/CartStore';
import config from 'utils/config';

const Dashboard = () => {
  const { t } = useTranslation();
  // TODO: retrieve brokerId from context when available
  const brokerId = Number(config.brokerId);
  const { data, isError, refetch } = utils.loaders.getLastReceipts(brokerId);
  const theme = useTheme();
  const { userInfo } = useUserInfo();
  const [searchParams, setSearchParams] = useSearchParams();

  const Content = () => {
    if (isError || !data?.content) return <Retry action={refetch} />;
    if (data?.content?.length === 0) return <Empty />;
    return <TransactionsList rows={data?.content} hideDateOrdering />;
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
        <Typography variant="h3" aria-label={t('app.dashboard.greeting')}>
          {userInfo?.name &&
            t('app.dashboard.title', {
              username: utils.converters.capitalizeFirstLetter(userInfo.name)
            })}
        </Typography>
        <PaymentButton />
      </Stack>
      <Stack gap={5}>
        {utils.config.showNotices && <PaymentNotice.Preview />}
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
