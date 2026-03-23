import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES, OUTCOMES } from 'routes/routes';
import appStore from 'store/appStore';

export type RouteGuardProps = {
  redirectTo?: string;
  itemKeys?: string[];
  storage?: Storage;
  children: React.ReactNode;
  conditionFn?: () => boolean;
};

/**
 * conditionFn is a function that returns true if the route is allowed, false otherwise
 * if conditionFn is not provided, the route is allowed if all itemKeys are present in the storage
 */
export const RouteGuard = ({
  redirectTo = ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['401']),
  storage = sessionStorage,
  itemKeys = [],
  children,
  conditionFn
}: RouteGuardProps) => {
  if (conditionFn) {
    return conditionFn() ? children : <Navigate to={redirectTo} />;
  }
  const isAuthorized = itemKeys.every((key) => storage.getItem(key));

  return isAuthorized ? children : <Navigate to={redirectTo} />;
};

export const RouteGuardByAvailableRoutes = ({ path, children }: { path: string, children: React.ReactNode }) => {

  const conditionFn = () => {
    const availableRoutes = appStore.value.brokerInfo?.config?.availableRoutes;
    // if availableRoutes is not defined or empty, all routes are allowed
    if (!availableRoutes || availableRoutes.length === 0) {
      return true;
    }
    // check if the current path is in the available routes
    return availableRoutes?.includes(path) ?? false;
  }
  return <RouteGuard conditionFn={conditionFn} redirectTo={ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['403'])}>
    {children}
  </RouteGuard>;
};