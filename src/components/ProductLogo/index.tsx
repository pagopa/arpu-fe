import { Box } from '@mui/material';
import React from 'react';
import { brokerInfoState } from 'store/BrokerStore';

export const ProductLogo = () => {
  return (
    <Box>
      {brokerInfoState.value.brokerLogo ? (
        <img
          src={brokerInfoState.value.brokerLogo ?? ''}
          alt={`${brokerInfoState.value.brokerName} logo`}
          width="56"
        />
      ) : null}
    </Box>
  );
};
