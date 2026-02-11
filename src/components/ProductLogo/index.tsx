import { Box } from '@mui/material';
import React from 'react';
import appStore from 'store/appStore';

export const ProductLogo = () => {
  return (
    <Box>
      {appStore.value.brokerInfo?.brokerLogo ? (
        <img
          src={appStore.value.brokerInfo?.brokerLogo ?? ''}
          alt={`${appStore.value.brokerInfo?.brokerName} logo`}
          width="56"
        />
      ) : null}
    </Box>
  );
};
