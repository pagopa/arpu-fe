import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES, OUTCOMES } from 'routes/routes';

export const ErrorFallback = () => (
  <Navigate to={ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES['400'])} />
);
