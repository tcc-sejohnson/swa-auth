import React, { createContext, useContext } from 'react';
import { ProvideAuth, ProvideAuthProps } from '../../../auth/auth';

export interface AuthRouterProps {
  loginRoute: string;
  unauthorizedRoute: string;
}

const DEFAULT_AUTH_ROUTER_PROPS = {
  loginRoute: '/login',
  unauthorizedRoute: '/unauthorized',
};

const authRouterContext = createContext<AuthRouterProps>(DEFAULT_AUTH_ROUTER_PROPS);

const useAuthRoutes: () => AuthRouterProps = () => useContext(authRouterContext);

/**
 * A generic method for creating AuthRouters. Internal use only.
 * I'm not super satisfied with the any typing on the ReactRouter, but I can't
 * find a better way to do it with react-router-dom's typings.
 * @param ReactRouter A React Router from the react-router-dom library.
 */
const AuthRouter = <TRouterProps,>(ReactRouter: any) => {
  return ({
    disallowedLoginProviders,
    loginRoute,
    unauthorizedRoute,
    children,
    ...rest
  }: ProvideAuthProps & Partial<AuthRouterProps> & TRouterProps): JSX.Element => {
    const authProps: AuthRouterProps = {
      loginRoute: loginRoute ?? DEFAULT_AUTH_ROUTER_PROPS.loginRoute,
      unauthorizedRoute: unauthorizedRoute ?? DEFAULT_AUTH_ROUTER_PROPS.unauthorizedRoute,
    };
    return (
      <ProvideAuth disallowedLoginProviders={disallowedLoginProviders}>
        <authRouterContext.Provider value={authProps}>
          <ReactRouter {...rest}>{children}</ReactRouter>
        </authRouterContext.Provider>
      </ProvideAuth>
    );
  };
};
export default AuthRouter;

export { useAuthRoutes };
