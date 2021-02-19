import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth, authorize } from '../../auth';
import { PrivateRouteComponent } from './privateRouteTypes';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders the unauthorizedRedirect ReactNode.
 */
const PrivateRoute: PrivateRouteComponent = ({
  path,
  allowedRoles,
  unauthorizedRedirect,
  allBut,
  children,
  ...rest
}) => {
  const auth = useAuth();
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  return <Route path={path} {...rest} render={() => (isAuthorized ? children : unauthorizedRedirect)} />;
};

export default PrivateRoute;
