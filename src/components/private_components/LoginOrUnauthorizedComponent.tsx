import React from 'react';
import { useAuth, Roles } from '../../auth/auth';
import ProtectedComponent from './ProtectedComponent';

export interface LoginOrUnauthorizedComponentProps {
  allowedRoles: Roles;
  allBut?: boolean;
  unauthorizedComponent: JSX.Element;
  loginComponent: JSX.Element;
  authenticatingComponent?: JSX.Element;
  children: React.ReactNode;
}

const AssignUnauthorizedComponent = ({
  unauthorizedComponent,
  loginComponent,
}: {
  unauthorizedComponent: JSX.Element;
  loginComponent: JSX.Element;
}) => {
  const auth = useAuth();
  if (auth.isLoggedIn) {
    return unauthorizedComponent;
  } else {
    return loginComponent;
  }
};

/**
 * Renders its children if the user is in one of the allowed roles,
 * else renders an unauthorized component. Useful for contextually rendering objects for different
 * classes of user.
 */
const LoginOrUnauthorizedComponent: React.VFC<LoginOrUnauthorizedComponentProps> = ({
  allowedRoles,
  allBut,
  unauthorizedComponent,
  loginComponent,
  authenticatingComponent,
  children,
}: LoginOrUnauthorizedComponentProps) => (
  <ProtectedComponent
    allowedRoles={allowedRoles}
    allBut={allBut}
    authenticatingComponent={authenticatingComponent}
    unauthorizedComponent={AssignUnauthorizedComponent({ unauthorizedComponent, loginComponent })}
  >
    {children}
  </ProtectedComponent>
);

export default LoginOrUnauthorizedComponent;
