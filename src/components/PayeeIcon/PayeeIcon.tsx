import Box from '@mui/material/Box';
import React, { SyntheticEvent } from 'react';
import style from 'utils/style';
import storage from 'utils/storage';
import loaders from 'utils/loaders';

export interface payeeIconProps {
  alt?: string;
  visible?: boolean;
  orgFiscalCode: string;
}

export const PayeeIcon = (props: payeeIconProps) => {
  function onErrorImage(e: SyntheticEvent) {
    (e.target as HTMLImageElement).src = '/cittadini/images/fallback-ec.png';
  }

  const brokerId = storage.app.getBrokerId() || -1;

  const { data: logo } = loaders.public.getPublicOrganizationLogo(brokerId, props.orgFiscalCode);

  return (
    <Box
      width={48}
      height={48}
      border={`solid 1px ${style.theme.palette.divider}`}
      borderRadius={6}
      alignItems="center"
      display={props.visible ? 'flex' : 'none'}
      justifyContent="center">
      <img
        src={logo?.orgLogo}
        alt={props?.alt ? props.alt : 'Logo Ente'}
        aria-hidden="true"
        data-testid="payeelogoimg"
        style={{ width: '55%' }}
        onError={(e) => {
          onErrorImage(e);
        }}
      />
    </Box>
  );
};
