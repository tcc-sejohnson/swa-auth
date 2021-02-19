import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth, authorize } from '../../auth/auth';
import { PrivateRouteComponent } from './privateRouteTypes';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders a redirect to the configured "login" uri.
 */
const PrivateRouteLoginRedirect: PrivateRouteComponent = ({ path, allowedRoles, allBut, children, ...rest }) => {
  const auth = useAuth();
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  return <Route path={path} {...rest} render={() => (isAuthorized ? children : <Redirect to={auth.loginPath} />)} />;
};

export default PrivateRouteLoginRedirect;
