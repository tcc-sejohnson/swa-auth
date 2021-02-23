import React from 'react';
import { BrowserRouter as Router, BrowserRouterProps } from 'react-router-dom';
import { ProvideAuthProps } from '../../../auth/auth';
import AuthRouter, { AuthRouterProps } from './AuthRouter';

const AuthBrowserRouter: React.VFC<
  ProvideAuthProps & Partial<AuthRouterProps> & BrowserRouterProps
> = AuthRouter<BrowserRouterProps>(Router);

export default AuthBrowserRouter;
