import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { Roles } from '../../../auth/auth';
import { useAuthRoutes } from '../routers/AuthRouter';
import LoginOrUnauthorizedComponent from '../../private_components/LoginOrUnauthorizedComponent';

export interface LoginOrUnauthorizedRedirectRouteProps {
  allowedRoles: Roles;
  allBut?: boolean;
  authenticatingComponent?: JSX.Element;
  children: React.ReactNode;
}

const LoginOrUnauthorizedRedirectRoute: React.VFC<LoginOrUnauthorizedRedirectRouteProps & RouteProps> = ({
  allowedRoles,
  allBut,
  authenticatingComponent,
  children,
  ...rest
}: LoginOrUnauthorizedRedirectRouteProps & RouteProps) => {
  const authRoutes = useAuthRoutes();
  return (
    <Route {...rest}>
      <LoginOrUnauthorizedComponent
        allowedRoles={allowedRoles}
        allBut={allBut}
        authenticatingComponent={authenticatingComponent}
        unauthorizedComponent={<Redirect to={authRoutes.unauthorizedRoute} />}
        loginComponent={<Redirect to={authRoutes.loginRoute} />}
      >
        {children}
      </LoginOrUnauthorizedComponent>
    </Route>
  );
};

export default LoginOrUnauthorizedRedirectRoute;
