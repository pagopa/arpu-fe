import Box from '@mui/material/Box';
import React, { SyntheticEvent } from 'react';
import storage from 'utils/storage';
import loaders from 'utils/loaders';

export interface payeeIconProps {
  alt?: string;
  visible?: boolean;
  orgFiscalCode: string;
  size?: number;
}

export const PayeeIcon = (props: payeeIconProps) => {
  function onErrorImage(e: SyntheticEvent) {
    (e.target as HTMLImageElement).src = '/cittadini/images/fallback-ec.png';
  }

  const brokerId = storage.app.getBrokerId();

  const { data: logo } = loaders.public.getPublicOrganizationLogo(brokerId, props.orgFiscalCode);

  const size = props.size ?? 48;

  return (
    <Box
      flexShrink={0}
      width={size}
      height={size}
      alignItems="center"
      display={props.visible ? 'flex' : 'none'}
      justifyContent="center">
      <img
        src={logo?.orgLogo}
        alt={props?.alt ? props.alt : 'Logo Ente'}
        aria-hidden="true"
        data-testid="payeelogoimg"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={(e) => {
          onErrorImage(e);
        }}
      />
    </Box>
  );
};
