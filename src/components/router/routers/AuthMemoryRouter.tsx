import React from 'react';
import { MemoryRouter as Router, MemoryRouterProps } from 'react-router-dom';
import { ProvideAuthProps } from '../../../auth/auth';
import AuthRouter, { AuthRouterProps } from './AuthRouter';

const AuthMemoryRouter: React.VFC<
  ProvideAuthProps & Partial<AuthRouterProps> & MemoryRouterProps
> = AuthRouter<MemoryRouterProps>(Router);

export default AuthMemoryRouter;
