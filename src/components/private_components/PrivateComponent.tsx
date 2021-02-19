import React from 'react';
import { useAuth, authorize, PrivateComponent } from '../../auth/auth';

/**
 * Renders its children if the user is in one of the allowed roles,
 * else does not render. Useful for contextually rendering objects for different
 * classes of user.
 */
const PrivateRoute: PrivateComponent = ({ allowedRoles, allBut, children }) => {
  const auth = useAuth();
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  return isAuthorized ? <div>{children}</div> : <div></div>;
};

export default PrivateRoute;
