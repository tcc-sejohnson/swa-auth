import React from 'react';
import { useAuth, authorize, Roles } from '../../auth/auth';

export interface ProtectedComponentProps {
  allowedRoles: Roles;
  allBut?: boolean;
  unauthorizedComponent: JSX.Element;
  authenticatingComponent?: JSX.Element;
  children: React.ReactNode;
}

/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders an unauthorized component. Useful for contextually rendering objects for different
 * classes of user.
 */
const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  allowedRoles,
  allBut,
  unauthorizedComponent,
  authenticatingComponent,
  children,
}) => {
  const auth = useAuth();
  if (auth.isAuthenticating) {
    return authenticatingComponent ?? <div>Authenticating, please wait...</div>;
  }
  const isAuthorized = authorize(allowedRoles, auth.user, allBut);
  return isAuthorized ? <>{children}</> : unauthorizedComponent;
};

export default ProtectedComponent;
