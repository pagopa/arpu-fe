import React, { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import utils from 'utils';
import { HeaderAccount } from '@pagopa/mui-italia';
import { Footer } from './Footer';
import { Outlet, useMatches } from 'react-router-dom';
import { BackButton } from './BackButton';
import { RouteHandleObject } from 'models/Breadcrumbs';

const defaultRouteHandle: RouteHandleObject = {
  sidebar: { visible: true },
  crumbs: { routeName: '', elements: [] },
  backButton: false
};

export function PreLoginLayout({ children }: { children?: ReactNode }) {
  const ASSISTANCE_MAIL = utils.config.assistanceLink;
  const onAssistanceClick = () => {
    window.open(`mailto:${ASSISTANCE_MAIL}`);
  };

  const matches = useMatches();

  const { backButtonText, backButtonFunction } = {
    ...defaultRouteHandle,
    ...(matches.find((match) => Boolean(match.handle))?.handle || {})
  } as RouteHandleObject;

  return (
    <Stack>
      <HeaderAccount
        rootLink={utils.config.pagopaLink}
        onAssistanceClick={onAssistanceClick}
        enableLogin={false}
      />
      <Box padding={3} width={'100%'} component="main">
        <BackButton onClick={backButtonFunction} text={backButtonText} />
        {children || <Outlet />}
      </Box>
      <Footer />
    </Stack>
  );
}
