import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Theme } from './utils/style';
import { PublicLayout, AuthLayout } from './components/Layout';
import { ArcErrors, ArcRoutes } from './routes/routes';
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
import Resources from 'routes/Resources';
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

const router = createBrowserRouter([
  {
    path: '*',
    element: <Navigate replace to={ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors['404'])} />
  },
  {
    path: ArcRoutes.AUTH_CALLBACK,
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
        element: <Navigate to={ArcRoutes.DASHBOARD} />
      },
      {
        element: <PublicLayout />,
        handle: {
          sidebar: false,
          backButton: false,
          subHeader: false,
          backButtonText: 'exit',
          gutters: true
        } as RouteHandleObject,
        children: [
          {
            path: ArcRoutes.LOGIN,
            element: <Login />,
            handle: {
              titleKey: 'pageTitles.logIn',
              gutters: false
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.public.PAYMENTS_ON_THE_FLY,
            children: [
              {
                index: true,
                element: <Spontanei />,
                handle: {
                  backButton: true,
                  subHeader: true,
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              },
              {
                path: 'download/:orgId/:iuv',
                element: <Download />,
                handle: {
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              }
            ]
          },
          {
            path: ArcRoutes.public.DEBT_POSITION_SEARCH,
            element: <DebtPositionsSearch />,
            handle: {
              titleKey: 'pageTitles.debtPositionsSearch',
              subHeader: true,
              backButton: true
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.public.DEBT_POSITION_DOWNLOAD,
            element: <DebtPositionDownload />,
            handle: {
              titleKey: 'pageTitles.debtPositionsDownload'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.public.RECEIPTS_SEARCH,
            element: <ReceiptsSearch />,
            handle: {
              titleKey: 'pageTitles.receiptsSearch',
              sidebar: false,
              subHeader: true,
              backButton: true
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.public.RECEIPT,
            element: <ReceiptDetail />,
            handle: {
              titleKey: 'pageTitles.receiptDetail'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.TOS,
            element: <Resources resource="tos" />,
            handle: {
              titleKey: 'pageTitles.tos'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.PRIVACY_POLICY,
            element: <Resources resource="pp" />,
            handle: {
              titleKey: 'pageTitles.pp'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.COURTESY_PAGE,
            loader: ({ params }) => Promise.resolve(params.error),
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
            path: ArcRoutes.DASHBOARD,
            element: <DashboardRoute />
          },
          {
            path: ArcRoutes.USER,
            element: <UserRoute />,
            handle: {
              backButton: true,
              sidebar: false,
              titleKey: 'pageTitles.userpage'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.RECEIPTS,
            element: <ReceiptsList />,
            handle: {
              titleKey: 'pageTitles.receiptsList'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.RECEIPT,
            element: <ReceiptDetail />,
            handle: {
              titleKey: 'pageTitles.receiptDetail'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.DEBT_POSITIONS,
            element: <DebtPositionsList />,
            handle: {
              titleKey: 'pageTitles.debtPositionsList'
            }
          },
          {
            path: ArcRoutes.DEBT_POSITION,
            element: <DebtPositionDetail />,
            handle: {
              titleKey: 'pageTitles.debtPositionDetail'
            }
          },
          {
            path: ArcRoutes.DEBT_POSITION_DOWNLOAD,
            element: <DebtPositionDownload />,
            handle: {
              titleKey: 'pageTitles.debtPositionsDownload'
            }
          },
          {
            path: ArcRoutes.PAYMENTS_ON_THE_FLY,
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
                path: 'download/:orgId/:iuv',
                element: <Download />,
                handle: {
                  backButton: false,
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              }
            ]
          },
          {
            path: ArcRoutes.ASSISTANCE,
            element: <Assistance />,
            handle: {
              sidebar: false,
              titleKey: 'pageTitles.assistance'
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
          <RouterProvider router={router} />
        </Theme>
      </LocalizationProvider>
    </>
  );
};
