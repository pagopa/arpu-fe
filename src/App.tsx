import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Theme } from './utils/style';
import { Layout } from './components/Layout';
import { ArcErrors, ArcRoutes } from './routes/routes';
import DashboardRoute from './routes/Dashboard';
import UserRoute from 'routes/User';
import { RouteHandleObject } from 'models/Breadcrumbs';
import { ErrorFallback } from 'components/ErrorFallback';
import { HealthCheck } from 'components/HealthCheck';
import { CourtesyPage } from 'routes/CourtesyPage';
import Login from 'routes/Login';
import Assistance from 'routes/Assistance';
import { RouteGuard } from 'components/RouteGuard';
import utils from 'utils';
import AuthCallback from 'routes/AuthCallback';
import Resources from 'routes/Resources';
import { getTokenOneidentity } from 'utils/loaders';
import { PreLoginLayout } from 'components/PreLoginLayout';
import { ApiClient } from 'components/ApiClient';
import Spontanei from 'routes/Spontanei';
import Download from 'components/Spontanei/Download';
import { ReceiptsList } from 'routes/Receipts/list';
import { ReceiptDetail } from 'routes/Receipts/detail';
import { DebtPositionsList } from 'routes/DebtPositions/list';
import { ReceiptsSearch } from 'routes/Receipts/search';
import DebtPositionDetail from 'routes/DebtPositionDetail';
import { StorageItems } from 'utils/storage';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DebtPositionsSearch } from 'routes/DebtPositions/search';
import { it } from 'date-fns/locale/it';
import { Overlay } from 'components/Overlay';
import { DebtPositionDownload } from 'routes/DebtPositions/download';
import { appSetup } from 'utils/setup';
import appStore from 'store/appStore';

const withGuard = (Component: () => React.JSX.Element) => (
  <RouteGuard itemKeys={[StorageItems.TOKEN]} storage={window.localStorage}>
    <Component />
  </RouteGuard>
);

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
        element: <PreLoginLayout />,
        children: [
          {
            path: ArcRoutes.LOGIN,
            element: <Login />,
            handle: {
              titleKey: 'pageTitles.login'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.public.RECEIPTS_SEARCH,
            element: <ReceiptsSearch />,
            handle: {
              titleKey: 'pageTitles.receiptsSearch'
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
            path: ArcRoutes.public.DEBT_POSITION_DOWNLOAD,
            element: <DebtPositionDownload />
          },
          {
            path: ArcRoutes.public.DEBT_POSITION_SEARCH,
            element: <DebtPositionsSearch />,
            handle: {
              titleKey: 'pageTitles.debtPositionsSearch'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.TOS,
            element: <Resources resource="tos" />
          },
          {
            path: ArcRoutes.PRIVACY_POLICY,
            element: <Resources resource="pp" />
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
        path: ArcRoutes.DASHBOARD,
        element: withGuard(() => <Layout />),
        children: [
          {
            index: true,
            element: <DashboardRoute />
          },
          {
            path: ArcRoutes.USER,
            element: <UserRoute />,
            handle: {
              backButton: true,
              sidebar: { visibile: false },
              titleKey: 'pageTitles.userpage'
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
            path: ArcRoutes.DEBT_POSITION_DOWNLOAD,
            element: <DebtPositionDownload />
          },
          {
            path: ArcRoutes.RECEIPTS,
            element: <ReceiptsList />,
            handle: {
              titleKey: 'pageTitles.receiptsList'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.DEBT_POSITION,
            element: <DebtPositionDetail />,
            handle: {
              titleKey: 'pageTitles.debtPositionDetail'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.DEBT_POSITIONS,
            element: <DebtPositionsList />,
            handle: {
              titleKey: 'pageTitles.debtPositionsList'
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.PAYMENTS_ON_THE_FLY,
            children: [
              {
                index: true,
                element: <Spontanei />,
                handle: {
                  backButton: true,
                  sidebar: { visibile: false },
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              },
              {
                path: 'download/:orgId/:iuv',
                element: <Download />,
                handle: {
                  backButton: false,
                  sidebar: { visibile: false },
                  titleKey: 'pageTitles.spontanei'
                } as RouteHandleObject
              }
            ]
          },
          {
            path: ArcRoutes.ASSISTANCE,
            element: <Assistance />,
            handle: {
              backButton: false,
              sidebar: {
                visibile: false
              },
              titleKey: 'pageTitles.assistance'
            } as RouteHandleObject
          }
        ]
      },
      {
        path: ArcRoutes.public.PAYMENTS_ON_THE_FLY,
        element: <Layout anonymous={true} />,
        children: [
          {
            index: true,
            element: <Spontanei />,
            handle: {
              backButton: true,
              sidebar: { visibile: false },
              titleKey: 'pageTitles.spontanei'
            } as RouteHandleObject
          },
          {
            path: 'download/:orgId/:iuv',
            element: <Download />,
            handle: {
              backButton: false,
              sidebar: { visibile: false },
              titleKey: 'pageTitles.spontanei'
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
