import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  LoaderFunctionArgs,
  Navigate,
  RouterProvider,
  createBrowserRouter
} from 'react-router-dom';
import { Theme } from './utils/style';
import { PublicLayout, AuthLayout } from './components/Layout';
import { ROUTES, OUTCOMES } from './routes/routes';
import DashboardRoute from './routes/Dashboard';
import UserRoute from 'routes/User';
import { RouteHandleObject } from 'models/Breadcrumbs';
import { ErrorFallback } from 'components/ErrorFallback';
import { HealthCheck } from 'components/HealthCheck';
import { CourtesyPage } from 'routes/CourtesyPage';
import Login from 'routes/Login';
import Assistance from 'routes/Assistance';
import utils from 'utils';
import AuthCallback from 'routes/AuthCallback';
import { getTokenOneidentity } from 'utils/loaders';
import { ApiClient } from 'components/ApiClient';
import Spontanei from 'routes/Spontanei';
import Download from 'components/Spontanei/Download';
import { ReceiptsList } from 'routes/Receipts/list';
import { ReceiptDetail } from 'routes/Receipts/detail';
import { DebtPositionsList } from 'routes/DebtPositions/list';
import { ReceiptsSearch } from 'routes/Receipts/search';
import DebtPositionDetail from 'routes/DebtPositionDetail';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DebtPositionsSearch } from 'routes/DebtPositions/search';
import { it } from 'date-fns/locale/it';
import { Overlay } from 'components/Overlay';
import { DebtPositionDownload } from 'routes/DebtPositions/download';
import { appSetup } from 'utils/setup';
import appStore from 'store/appStore';
import ResourcePage from 'routes/ResourcePage/ResourcePage';
import { RecaptchaProvider } from 'components/RecaptchaProvider/RecaptchaProvider';
import { RouteGuardByAvailableRoutes as Guard } from 'components/RouteGuard';

/**
 * Validates that the required query params (nav, org_fiscal_code, installment_id)
 * are present for outcomes that need them (pagamento-non-riuscito, pagamento-annullato).
 * If missing, throws an error caught by the errorElement (ErrorFallback).
 */
const courtesyPageLoader = ({ params, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const outcome = params.outcome as keyof typeof OUTCOMES;
  const code = OUTCOMES[outcome];

  const needsParams =
    code === OUTCOMES['pagamento-non-riuscito'] || code === OUTCOMES['pagamento-annullato'];

  if (needsParams) {
    const nav = url.searchParams.get('nav');
    const orgFiscalCode = url.searchParams.get('org_fiscal_code');
    if (!nav || !orgFiscalCode) {
      throw new Error('Missing required query params');
    }
  }

  return params.outcome ?? null;
};

const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <Navigate replace to={ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['404'])} />
    )
  },
  {
    path: ROUTES.AUTH_CALLBACK,
    element: <AuthCallback />,
    loader: ({ request }) => getTokenOneidentity(request)
  },
  {
    loader: appSetup,
    element: <ApiClient client={[utils.apiClient]} />,
    errorElement: <ErrorFallback />,
    children: [
      {
        path: '/',
        element: <Navigate to={ROUTES.DASHBOARD} />
      },
      {
        element: <PublicLayout />,
        handle: {
          sidebar: false,
          backButton: false,
          subHeader: true,
          backButtonText: 'exit',
          gutters: true
        } as RouteHandleObject,
        children: [
          {
            path: ROUTES.LOGIN,
            element: (
              <Guard path={ROUTES.LOGIN}>
                <Login />
              </Guard>
            ),
            handle: {
              titleKey: 'pageTitles.login',
              gutters: false,
              subHeader: false
            } as RouteHandleObject
          },
          {
            path: ROUTES.public.PAYMENTS_ON_THE_FLY,
            children: [
              {
                index: true,
                element: (
                  <Guard path={ROUTES.public.PAYMENTS_ON_THE_FLY}>
                    <Spontanei />
                  </Guard>
                ),
                handle: {
                  backButton: true,
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              },
              {
                path: ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD,
                element: (
                  <Guard path={ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD}>
                    <Download />
                  </Guard>
                ),
                handle: {
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              }
            ]
          },
          {
            path: ROUTES.public.DEBT_POSITION_SEARCH,
            element: (
              <Guard path={ROUTES.public.DEBT_POSITION_SEARCH}>
                <DebtPositionsSearch />
              </Guard>
            ),
            handle: {
              titleKey: 'pageTitles.debtPositionsSearch',
              backButton: true
            } as RouteHandleObject
          },
          {
            path: ROUTES.public.DEBT_POSITION_DOWNLOAD,
            element: (
              <Guard path={ROUTES.public.DEBT_POSITION_DOWNLOAD}>
                <DebtPositionDownload />
              </Guard>
            ),
            handle: {
              titleKey: 'pageTitles.debtPositionsDownload'
            } as RouteHandleObject
          },
          {
            path: ROUTES.public.RECEIPTS_SEARCH,
            element: (
              <Guard path={ROUTES.public.RECEIPTS_SEARCH}>
                <ReceiptsSearch />
              </Guard>
            ),
            handle: {
              titleKey: 'pageTitles.receiptsSearch',
              backButton: true
            } as RouteHandleObject
          },
          {
            path: ROUTES.public.RECEIPT,
            element: (
              <Guard path={ROUTES.public.RECEIPT}>
                <ReceiptDetail />
              </Guard>
            ),
            handle: {
              titleKey: 'pageTitles.receiptDetail',
              backButton: true
            } as RouteHandleObject
          },
          {
            path: ROUTES.TOS,
            element: <ResourcePage resource="tos" />,
            handle: {
              titleKey: 'pageTitles.tos'
            } as RouteHandleObject
          },
          {
            path: ROUTES.PRIVACY_POLICY,
            element: <ResourcePage resource="pp" />,
            handle: {
              titleKey: 'pageTitles.pp'
            } as RouteHandleObject
          },
          {
            path: ROUTES.public.COURTESY_PAGE,
            loader: courtesyPageLoader,
            element: <CourtesyPage />,
            handle: {
              titleKey: 'pageTitles.courtesy'
            } as RouteHandleObject
          }
        ]
      },
      {
        element: <AuthLayout />,
        handle: {
          sidebar: true,
          subHeader: true,
          backButton: false,
          gutters: true
        } as RouteHandleObject,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardRoute />
          },
          {
            path: ROUTES.USER,
            element: <UserRoute />,
            handle: {
              backButton: true,
              sidebar: false,
              titleKey: 'pageTitles.userpage'
            } as RouteHandleObject
          },
          {
            path: ROUTES.RECEIPTS,
            element: <ReceiptsList />,
            handle: {
              titleKey: 'pageTitles.receiptsList'
            } as RouteHandleObject
          },
          {
            path: ROUTES.RECEIPT,
            element: <ReceiptDetail />,
            handle: {
              titleKey: 'pageTitles.receiptDetail'
            } as RouteHandleObject
          },
          {
            path: ROUTES.DEBT_POSITIONS,
            element: <DebtPositionsList />,
            handle: {
              titleKey: 'pageTitles.debtPositionsList'
            }
          },
          {
            path: ROUTES.DEBT_POSITION,
            element: <DebtPositionDetail />,
            handle: {
              titleKey: 'pageTitles.debtPositionDetail'
            }
          },
          {
            path: ROUTES.DEBT_POSITION_DOWNLOAD,
            element: <DebtPositionDownload />,
            handle: {
              titleKey: 'pageTitles.debtPositionsDownload'
            }
          },
          {
            path: ROUTES.PAYMENTS_ON_THE_FLY,
            handle: {
              sidebar: false
            } as RouteHandleObject,
            children: [
              {
                index: true,
                element: <Spontanei />,
                handle: {
                  backButton: true,
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              },
              {
                path: 'download/:orgId/:nav',
                element: <Download />,
                handle: {
                  backButton: false,
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              }
            ]
          },
          {
            path: ROUTES.ASSISTANCE,
            element: <Assistance />,
            handle: {
              sidebar: false,
              titleKey: 'pageTitles.assistance'
            } as RouteHandleObject
          },
          {
            path: ROUTES.COURTESY_PAGE,
            element: <CourtesyPage />,
            loader: courtesyPageLoader,
            handle: {
              titleKey: 'pageTitles.courtesyPage',
              backButton: false,
              subHeader: true,
              sidebar: false,
              gutters: false
            } as RouteHandleObject
          }
        ]
      }
    ]
  }
]);

export const App = () => {
  const isReady = appStore.value.isReady;
  return (
    <>
      <HealthCheck />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={it.code}>
        <Overlay visible={!isReady} />
        <Theme>
          <Overlay />
          <RecaptchaProvider>
            <RouterProvider router={router} />
          </RecaptchaProvider>
        </Theme>
      </LocalizationProvider>
    </>
  );
};
