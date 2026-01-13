import { Box } from '@mui/material';
import React from 'react';
import utils from 'utils';

export const ProductLogo = () => {
  const brokerId = utils.storage.app.getBrokerId();
  const { data: brokerInfo } = utils.loaders.public.useBrokerInfo(brokerId);
  return (
    <Box>
      {brokerInfo?.brokerLogo ? (
        <img src={brokerInfo?.brokerLogo ?? ''} alt={`${brokerInfo?.brokerName} logo`} width="56" />
      ) : null}
    </Box>
  );
};
