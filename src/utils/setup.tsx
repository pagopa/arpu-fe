import React from 'react';
import utils from '.';
import config from './config';
import { CircularProgress, Stack } from '@mui/material';
import { ArcErrors, ArcRoutes } from 'routes/routes';
import { setBrokerInfo } from 'store/BrokerStore';

/** Initial setup function to prepare the application state and necessary config */
const stateSetup = async () => {
  const { data } = await utils.apiClient.public.getPublicBrokerInfo(config.brokerId);
  setBrokerInfo(data);
};

const setupOrError = async () => {
  try {
    await stateSetup();
  } catch {
    window.location.replace(`${ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors['404'])}`);
  }
};

const appSetup = async () => {
  await setupOrError();
  return true;
};

/** Fallback component to show while stateSetup is in progress */
const setupFallback = () => (
  <Stack justifyContent={'center'} alignItems={'center'} height={'100vh'}>
    <CircularProgress size={40} />
  </Stack>
);

export { setupOrError, setupFallback, appSetup };
