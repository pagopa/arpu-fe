import React, { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import utils from 'utils';
import { HeaderAccount, RootLinkType } from '@pagopa/mui-italia';
import { Footer } from './Footer';
import { Outlet, useMatches } from 'react-router-dom';
import { BackButton } from './BackButton';
import { RouteHandleObject } from 'models/Breadcrumbs';
import { ArcRoutes } from 'routes/routes';
import { PageTitleProvider } from './PageTitleProvider';

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

  const { backButton, backButtonText, backButtonFunction } = {
    ...defaultRouteHandle,
    ...(matches.find((match) => Boolean(match.handle))?.handle || {})
  } as RouteHandleObject;

  const brokerId = utils.storage.app.getBrokerId();
  const { data: brokerInfo } = utils.loaders.public.useBrokerInfo(brokerId);

  const rootLink: RootLinkType = {
    label: brokerInfo?.brokerName ?? '',
    href: ArcRoutes.DASHBOARD,
    ariaLabel: brokerInfo?.brokerName ?? '',
    title: brokerInfo?.brokerName ?? ''
  };

  return (
    <Stack>
      <PageTitleProvider />
      <HeaderAccount
        rootLink={rootLink}
        onAssistanceClick={onAssistanceClick}
        enableLogin={false}
      />
      <Box width={'100%'} component="main">
        {backButton && <BackButton onClick={backButtonFunction} text={backButtonText} />}
        {children || <Outlet />}
      </Box>
      <Footer />
    </Stack>
  );
}
