import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth, authorize, DefaultRoles } from '../../auth';
import { PrivateRouteComponent } from './privateRouteTypes';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else, if the user is not logged in, redirect to the login page,
 * else, if the user is logged in, redirect to the unauthorized page.
 */
const PrivateRouteLoginOrUnauthorizedRedirect: PrivateRouteComponent = ({
  allowedRoles,
  allBut,
  children,
  ...rest
}) => {
  const auth = useAuth();
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  const renderComponents = () => {
    if (isAuthorized) {
      return children;
    }
    if (auth.user.userRoles.length === 1) {
      if (auth.user.userRoles[0] === DefaultRoles.Anonymous) {
        return <Redirect to="/login" />;
      }
    }
    if (auth.user.userRoles.length === 0) {
      return <Redirect to="/login" />;
    }
    return <Redirect to="/unauthorized" />;
  };

  return <Route {...rest} render={renderComponents} />;
};

export default PrivateRouteLoginOrUnauthorizedRedirect;
