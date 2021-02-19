import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth, authorize } from '../../auth';
import { PrivateRouteComponent } from './privateRouteTypes';
/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders a redirect to the configured "unauthorized" uri.
 * @param param0
 */
const PrivateRouteLoginRedirect: PrivateRouteComponent = ({ allowedRoles, allBut, children, ...rest }) => {
  const auth = useAuth();
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  return <Route {...rest} render={() => (isAuthorized ? children : <Redirect to={auth.unauthorizedPath} />)} />;
};

export default PrivateRouteLoginRedirect;
