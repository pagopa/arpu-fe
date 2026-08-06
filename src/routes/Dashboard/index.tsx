import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PaymentButton from 'components/PaymentButton';
import { useUserInfo } from 'hooks/useUserInfo';
import { Receipts } from './components/Receipts';
import { DebtPositions } from './components/DebtPositions';

const Dashboard = () => {
  const { t } = useTranslation();
  const { userInfo } = useUserInfo();

  return (
    <>
      <Stack
        flex={1}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent={'space-between'}
        alignItems={{ sm: 'center' }}
        gap={3}
        mb={3}>
        <Typography
          variant="h3"
          component={'h1'}
          aria-label={t('app.dashboard.greetings')}
          sx={{ textTransform: 'capitalize' }}>
          {userInfo?.name &&
            t('app.dashboard.title', {
              username: userInfo.name
            })}
        </Typography>
        <PaymentButton />
      </Stack>
      <Stack gap={3}>
        <DebtPositions />
        <Receipts />
      </Stack>
    </>
  );
};

export default Dashboard;
