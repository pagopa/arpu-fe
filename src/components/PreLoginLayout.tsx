import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';
import utils from 'utils';
import { HeaderAccount } from '@pagopa/mui-italia';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';

export function PreLoginLayout({ children }: { children?: ReactNode }) {
  const ASSISTANCE_MAIL = utils.config.assistanceLink;
  const onAssistanceClick = () => {
    window.open(`mailto:${ASSISTANCE_MAIL}`);
  };

  return (
    <Stack>
      <HeaderAccount
        rootLink={utils.config.pagopaLink}
        onAssistanceClick={onAssistanceClick}
        enableLogin={false}
      />
      {children || <Outlet />}
      <Footer />
    </Stack>
  );
}
