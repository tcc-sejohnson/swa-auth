import { ProvideAuth, useAuth, authorize, DefaultRoles } from './auth/auth.js';
import PrivateRoute from './components/routes/PrivateRoute.js';
import PrivateRouteLoginOrUnauthorizedRedirect from './components/routes/PrivateRouteLoginOrUnauthorizedRedirect.js';
import PrivateRouteLoginRedirect from './components/routes/PrivateRouteLoginRedirect.js';
import PrivateRouteUnauthorizedRedirect from './components/routes/PrivateRouteUnauthorizedRedirect.js';
import PrivateComponent from './components/private_components/PrivateComponent.js';

export type {
  DevSettings,
  AuthorizationContext,
  AuthenticationStatus,
  Roles,
  User,
  PrivateComponentProps,
  ProvideAuthProps,
} from './auth/auth';

export {
  DefaultRoles,
  ProvideAuth,
  useAuth,
  authorize,
  PrivateRoute,
  PrivateRouteLoginOrUnauthorizedRedirect,
  PrivateRouteLoginRedirect,
  PrivateRouteUnauthorizedRedirect,
  PrivateComponent,
};
