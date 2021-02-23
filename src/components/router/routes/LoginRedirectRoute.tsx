import React from 'react';
import { Redirect, RouteProps } from 'react-router-dom';
import { Roles } from '../../../auth/auth';
import { useAuthRoutes } from '../routers/AuthRouter';
import ProtectedRoute from './ProtectedRoute';

export interface LoginRedirectRouteProps {
  allowedRoles: Roles;
  allBut?: boolean;
  authenticatingComponent?: JSX.Element;
  children: React.ReactNode;
}

const LoginRedirectRoute: React.VFC<LoginRedirectRouteProps & RouteProps> = ({
  allowedRoles,
  allBut,
  authenticatingComponent,
  children,
  ...rest
}: LoginRedirectRouteProps & RouteProps) => {
  const loginRoute = useAuthRoutes().loginRoute;
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      allBut={allBut}
      authenticatingComponent={authenticatingComponent}
      redirect={<Redirect to={loginRoute} />}
      {...rest}
    >
      {children}
    </ProtectedRoute>
  );
};

export default LoginRedirectRoute;
