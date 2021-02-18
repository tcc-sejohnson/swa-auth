import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth, authorize } from '../../auth';
import { PrivateRouteComponent } from './privateRouteTypes';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders the unauthorizedRedirect ReactNode.
 * @param param0
 */
const PrivateRoute: PrivateRouteComponent = ({ allowedRoles, unauthorizedRedirect, allBut, children, ...rest }) => {
    const auth = useAuth();
    const isAuthorized = authorize(allowedRoles, auth.user, allBut);
    return <Route {...rest} render={() => (isAuthorized ? children : unauthorizedRedirect)} />;
};

export default PrivateRoute;
