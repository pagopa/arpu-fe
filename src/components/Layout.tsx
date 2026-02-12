import React from 'react';
import { Alert, Box, Container, Snackbar, Stack, Theme, useMediaQuery } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar/Sidebar';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs';
import { NavigateNext } from '@mui/icons-material';
import { Outlet, useMatches } from 'react-router-dom';
import { RouteHandleObject } from 'models/Breadcrumbs';
import { Header } from './Header';
import { BackButton } from './BackButton';
import { ArcRoutes } from 'routes/routes';
import { ModalSystem } from './Modals';
import utils from 'utils';
import { useStore } from 'store/GlobalStore';
import { CartDrawer } from './Cart/CartDrawer';
import PaymentTypeDrawer from './Spontanei/PaymentTypeDrawer';
import InstallmentsDrawer from './InstallmentsDrawer';
import { SubHeader } from './Header/SubHeader';
import { ProductLogo } from 'components/ProductLogo';
import { HeaderAccount, RootLinkType } from '@pagopa/mui-italia';
import { PageTitleProvider } from './PageTitleProvider';

const defaultRouteHandle: RouteHandleObject = {
  sidebar: { visible: true },
  crumbs: { routeName: '', elements: [] },
  backButton: false
};

export function Layout(props: { anonymous?: boolean }) {
  const matches = useMatches();
  const {
    state: { cart, installmentsDrawer, paymentTypeDrawerVisibilityStatus }
  } = useStore();

  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const overlay = utils.sidemenu.status.overlay.value;
  const modalOpen = utils.modal.status.isOpen.value;

  document.body.style.overflow = modalOpen || cart.isOpen || overlay ? 'hidden' : 'auto';

  const { crumbs, sidebar, backButton, backButtonText, backButtonFunction } = {
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

  const ASSISTANCE_MAIL = utils.config.assistanceLink;
  const onAssistanceClick = () => {
    window.open(`mailto:${ASSISTANCE_MAIL}`);
  };

  return (
    <>
      <PageTitleProvider />
      <Snackbar
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={utils.notify.dismiss}
        open={utils.notify.status.isVisible.value}>
        <Alert severity={utils.notify.status.payload.value?.severity} variant="outlined">
          {utils.notify.status.payload.value?.text}
        </Alert>
      </Snackbar>
      <ModalSystem />
      <Container maxWidth={false} disableGutters>
        {!props.anonymous ? (
          <Header onAssistanceClick={() => window.open(ArcRoutes.ASSISTANCE, '_blank')} />
        ) : (
          <>
            <HeaderAccount
              rootLink={rootLink}
              onAssistanceClick={onAssistanceClick}
              enableLogin={false}
            />
            <SubHeader product={<ProductLogo />} />
          </>
        )}
        <Stack direction={lg ? 'row' : 'column'} bgcolor={grey['100']}>
          {sidebar?.visible ? <Sidebar /> : null}

          <Box padding={3} width={'100%'} component="main">
            {backButton && <BackButton onClick={backButtonFunction} text={backButtonText} />}
            {crumbs && (
              <Breadcrumbs crumbs={crumbs} separator={<NavigateNext fontSize="small" />} />
            )}
            <Outlet />
          </Box>
        </Stack>
        <Footer />
        {cart.isOpen ? <CartDrawer /> : null}
        {installmentsDrawer.isOpen ? <InstallmentsDrawer /> : null}
        {paymentTypeDrawerVisibilityStatus ? <PaymentTypeDrawer /> : null}
      </Container>
    </>
  );
}
