import React from 'react';
import { HashRouter as Router, HashRouterProps } from 'react-router-dom';
import { ProvideAuthProps } from '../../../auth/auth';
import AuthRouter, { AuthRouterProps } from './AuthRouter';

const AuthHashRouter: React.VFC<
  ProvideAuthProps & Partial<AuthRouterProps> & HashRouterProps
> = AuthRouter<HashRouterProps>(Router);

export default AuthHashRouter;
