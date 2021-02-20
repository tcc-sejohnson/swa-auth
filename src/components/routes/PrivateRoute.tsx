import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth, authorize } from '../../auth/auth';
import { PrivateRouteComponentProps } from './privateRouteTypes';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders the unauthorizedRedirect ReactNode.
 */
const PrivateRoute = ({
  allowedRoles,
  unauthorizedRedirect,
  allBut,
  children,
  ...rest
}: PrivateRouteComponentProps & { unauthorizedRedirect: React.ReactNode }): JSX.Element => {
  const auth = useAuth();
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  return <Route {...rest} render={() => (isAuthorized ? children : unauthorizedRedirect)} />;
};

export default PrivateRoute;
