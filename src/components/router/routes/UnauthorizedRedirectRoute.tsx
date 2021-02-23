import React from 'react';
import { Redirect, RouteProps } from 'react-router-dom';
import { Roles } from '../../../auth/auth';
import { useAuthRoutes } from '../routers/AuthRouter';
import ProtectedRoute from './ProtectedRoute';

export interface UnauthorizedRedirectRouteProps {
  allowedRoles: Roles;
  allBut?: boolean;
  authenticatingComponent?: JSX.Element;
  children: React.ReactNode;
}

const UnauthorizedRedirectRoute: React.VFC<UnauthorizedRedirectRouteProps & RouteProps> = ({
  allowedRoles,
  allBut,
  authenticatingComponent,
  children,
  ...rest
}: UnauthorizedRedirectRouteProps & RouteProps) => {
  const unauthorizedRoute = useAuthRoutes().unauthorizedRoute;
  return (
    <ProtectedRoute
      allowedRoles={allowedRoles}
      allBut={allBut}
      authenticatingComponent={authenticatingComponent}
      redirect={<Redirect to={unauthorizedRoute} />}
      {...rest}
    >
      {children}
    </ProtectedRoute>
  );
};

export default UnauthorizedRedirectRoute;
