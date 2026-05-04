import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { OUTCOMES, ROUTES } from '../routes';
import { Box, CircularProgress } from '@mui/material';
import { getTokenOneidentity } from 'utils/loaders';
import utils from 'utils';

export default function AuthCallback() {
  const result = useLoaderData() as Awaited<ReturnType<typeof getTokenOneidentity>>;

  if (result) {
    utils.storage.user.setToken(result.accessToken);
    window.location.replace(ROUTES.DASHBOARD);
  } else {
    window.location.replace(ROUTES.COURTESY_PAGE.replace(':outcome', OUTCOMES['408']));
  }

  return (
    <Box width={'100vw'} height={'100vh'} alignContent={'center'} textAlign={'center'}>
      <CircularProgress />
    </Box>
  );
}
