import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth, authorize, PrivateComponent } from '../../auth';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else does not render. Useful for contextually rendering objects for different
 * classes of user.
 */
const PrivateRoute: PrivateComponent = ({ allowedRoles, allBut, children, ...rest }) => {
    const auth = useAuth();
    const isAuthorized = authorize(allowedRoles, auth.user, allBut);
    return <Route {...rest} render={() => (isAuthorized ? children : null)} />;
};

export default PrivateRoute;
