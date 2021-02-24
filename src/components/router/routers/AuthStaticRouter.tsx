import React from 'react';
import { StaticRouter as Router, StaticRouterProps } from 'react-router-dom';
import { ProvideAuthProps } from '../../../auth/auth';
import AuthRouter, { AuthRouterProps } from './AuthRouter';

const AuthStaticRouter: React.VFC<
  ProvideAuthProps & Partial<AuthRouterProps> & StaticRouterProps
> = AuthRouter<StaticRouterProps>(Router);

export default AuthStaticRouter;
