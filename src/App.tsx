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

const withGuard = (Component: () => React.JSX.Element) => (
  <RouteGuard itemKeys={[StorageItems.TOKEN]} storage={window.localStorage}>
    <Component />
  </RouteGuard>
);

const router = createBrowserRouter([
  {
    element: <ApiClient client={[utils.apiClient]} />,
    errorElement: <ErrorFallback />,
    children: [
      {
        path: '*',
        element: (
          <Navigate replace to={ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors['404'])} />
        )
      },
      {
        path: '/',
        element: <Navigate replace to={ArcRoutes.DASHBOARD} />
      },
      {
        path: ArcRoutes.LOGIN,
        element: (
          <PreLoginLayout>
            <Login />
          </PreLoginLayout>
        ),
        handle: {
          backButton: false
        } as RouteHandleObject
      },
      {
        path: ArcRoutes.public.RECEIPTS_SEARCH,
        element: (
          <PreLoginLayout>
            <ReceiptsSearch />
          </PreLoginLayout>
        )
      },
      {
        path: ArcRoutes.public.RECEIPT,
        element: (
          <PreLoginLayout>
            <ReceiptDetail />
          </PreLoginLayout>
        )
      },
      {
        path: ArcRoutes.public.DEBT_POSITION_DOWNLOAD,
        element: (
          <PreLoginLayout>
            <DebtPositionDownload />
          </PreLoginLayout>
        )
      },
      {
        path: ArcRoutes.AUTH_CALLBACK,
        element: <AuthCallback />,
        loader: ({ request }) => getTokenOneidentity(request)
      },
      {
        path: ArcRoutes.TOS,
        element: (
          <PreLoginLayout>
            <Resources resource="tos" />
          </PreLoginLayout>
        )
      },
      {
        path: ArcRoutes.PRIVACY_POLICY,
        element: (
          <PreLoginLayout>
            <Resources resource="pp" />
          </PreLoginLayout>
        )
      },
      {
        path: ArcRoutes.COURTESY_PAGE,
        element: (
          <PreLoginLayout>
            <CourtesyPage />
          </PreLoginLayout>
        )
      },
      {
        path: ArcRoutes.DASHBOARD,
        element: <Layout />,
        children: [
          {
            path: ArcRoutes.ASSISTANCE,
            element: withGuard(Assistance),
            handle: {
              backButton: false,
              sidebar: {
                visibile: false
              }
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.USER,
            element: withGuard(UserRoute),
            handle: {
              backButton: true,
              sidebar: {
                visibile: false
              }
            } as RouteHandleObject
          },
          {
            path: ArcRoutes.DASHBOARD,
            element: withGuard(DashboardRoute)
          },
          {
            path: ArcRoutes.RECEIPT,
            element: withGuard(ReceiptDetail)
          },
          {
            path: ArcRoutes.DEBT_POSITION_DOWNLOAD,
            element: withGuard(DebtPositionDownload),
            handle: {
              sidebar: {
                visibile: false
              }
            }
          },
          {
            path: ArcRoutes.RECEIPTS,
            element: withGuard(ReceiptsList)
          },
          {
            path: ArcRoutes.DEBT_POSITION,
            element: withGuard(DebtPositionDetail)
          },
          {
            path: ArcRoutes.DEBT_POSITIONS,
            element: withGuard(DebtPositionsList)
          },
          {
            path: ArcRoutes.COURTESY_PAGE,
            loader: ({ params }) => Promise.resolve(params.error),
            element: <CourtesyPage />,
            handle: {
              sidebar: {
                visibile: false
              }
            }
          },
          {
            path: ArcRoutes.PAYMENTS_ON_THE_FLY,
            children: [
              {
                index: true,
                element: <Spontanei />,
                handle: {
                  backButton: true,
                  sidebar: {
                    visibile: false
                  }
                }
              },
              {
                path: 'download/:orgId/:iuv',
                element: <Download />,
                handle: {
                  backButton: false,
                  sidebar: {
                    visibile: false
                  }
                }
              }
            ]
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
              sidebar: {
                visibile: false
              }
            }
          },
          {
            path: 'download/:orgId/:iuv',
            element: <Download />,
            handle: {
              backButton: false,
              sidebar: {
                visibile: false
              }
            }
          }
        ]
      },
      {
        path: ArcRoutes.public.DEBT_POSITION_SEARCH,
        element: <Layout anonymous={true} />,
        children: [
          {
            index: true,
            element: <DebtPositionsSearch />,
            handle: {
              sidebar: {
                visibile: false
              }
            }
          }
        ]
      }
    ]
  }
]);

export const App = () => (
  <>
    <HealthCheck />
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={it.code}>
      <Theme>
        <Overlay />
        <RouterProvider router={router} />
      </Theme>
    </LocalizationProvider>
  </>
);
