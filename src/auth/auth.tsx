import React, { useContext, createContext, useState, useEffect } from 'react';
import { cloneDeep } from 'lodash';

const DEFAULT_USER: User = {
  identityProvider: '',
  userId: '',
  userDetails: '',
  userRoles: [],
};

const DEFAULT_DEV_SETTINGS: DevSettings = {
  on: false,
  userOverride: DEFAULT_USER,
};

const DEFAULT_AUTHENTICATION_STATUS: AuthenticationStatus = {
  isAuthenticating: false,
  setIsAuthenticating: undefined,
};

const DEFAULT_AUTH_CONTEXT: AuthorizationContext = {
  user: DEFAULT_USER,
  authenticationStatus: DEFAULT_AUTHENTICATION_STATUS,
  loginPath: '/login',
  unauthorizedPath: '/login',
  devSettings: DEFAULT_DEV_SETTINGS,
};

/**
 * A set of default roles you can use to authorize your users.
 * Want to make your own? Sure! Just declare your own enum.
 * You can also union your enum with this one to "inherit" its members.
 */
export enum DefaultRoles {
  Authenticated = 'authenticated',
  Anonymous = 'anonymous',
  GlobalAdmin = 'global_admin',
  GlobalViewer = 'global_viewer',
}

export interface AuthenticationStatus {
  isAuthenticating: boolean;
  setIsAuthenticating: React.Dispatch<React.SetStateAction<boolean>> | undefined;
}

/**
 * If on === true, userOverride will be returned instead of
 * the actual user value from /.auth/me. This is useful for
 * local development.
 */
export interface DevSettings {
  on: boolean;
  userOverride: User;
}

/**
 * The settings used for the authorization library.
 */
export interface AuthorizationContext {
  user: User;
  authenticationStatus: AuthenticationStatus;
  loginPath: string;
  unauthorizedPath: string;
  devSettings: DevSettings;
}

/**
 * An array of user roles.
 */
export type Roles = string[];

/**
 * A user object from Azure Static Webapps /.auth/me.
 * See https://docs.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript#client-principal-data
 */
export type User = {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: Roles;
};

export interface PrivateComponentProps {
  allowedRoles: Roles;
  allBut?: boolean;
  children: React.ReactNode;
}

export interface ProvideAuthProps {
  customContext?: Partial<AuthorizationContext>;
  children: React.ReactNode;
}

export type PrivateComponent = (props: PrivateComponentProps & { [key: string]: any }) => JSX.Element;

/**
 * Given a userSetter function accepting a User parameter, asynchronously
 * retrieve the user information from /.auth/me.
 * @param userSetter
 */
const getUser = async (userSetter: (user: User) => void): Promise<void> => {
  const resp = await fetch('/.auth/me');
  if (!resp.ok) {
    userSetter(DEFAULT_USER);
  }
  try {
    const json: User = (await resp.json()).clientPrincipal;
    userSetter(json);
  } catch (e) {
    userSetter(DEFAULT_USER);
  }
};

const authContext = createContext<AuthorizationContext>(DEFAULT_AUTH_CONTEXT);

/**
 * Wrap components in this element to give them access to useAuth.
 * If you want your whole app to be access-controlled, wrapp your App component.
 * Any component using useAuth will have access to the full AuthorizationContext.
 * If a customContext is provided, it will override the default context on initialization.
 */
const ProvideAuth = ({ customContext, children }: ProvideAuthProps): JSX.Element => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [ctx, setCtx] = useState<AuthorizationContext>({
    ...DEFAULT_AUTH_CONTEXT,
    ...customContext,
  });
  useEffect(() => {
    setIsAuthenticating(true);
    const newContext = cloneDeep(ctx);
    newContext.authenticationStatus = {
      isAuthenticating: isAuthenticating,
      setIsAuthenticating: setIsAuthenticating,
    };
    if (ctx.devSettings.on) {
      newContext.user = ctx.devSettings.userOverride;
      setCtx(newContext);
    } else {
      const setter = (newUser: User) => {
        newContext.user = newUser;
        setCtx(newContext);
      };
      getUser(setter);
    }
    setIsAuthenticating(false);
  }, []);
  return <authContext.Provider value={ctx}>{children}</authContext.Provider>;
};

/**
 * Gives access to the AuthorizationContext object from ProvideAuth.
 */
const useAuth = (): AuthorizationContext => {
  return useContext(authContext);
};

/**
 * Determine whether a given user is authorized to access a resource given a set of allowed roles.
 * If allBut === true, the user will be authorized if they're a member of any role outside of the set of allowedRoles.
 * If allBut === false, the user will be authorized if they're a member of any role inside of the set of allowedRoles.
 * @param allowedRoles A string array of roles to validate against.
 * @param user An Azure Static Webapps User object (see the definition of the User type for more information).
 * @param allBut Whether the component should be authorized based on "all but" the provided roles or simply on the provided roles.
 */
const authorize = (allowedRoles: Roles, user: User, allBut = false): boolean => {
  let authorized = false;
  if (allBut) {
    // Make sure the user has at least one role that is not included in the list of disallowed roles
    authorized = user.userRoles.some((role) => !allowedRoles.includes(role));
  } else {
    // Make sure the user has at least one role that is included in the list of allowed roles
    authorized = user.userRoles.some((role) => allowedRoles.includes(role));
  }
  return authorized;
};

export default ProvideAuth;

export { ProvideAuth, useAuth, authorize, DEFAULT_AUTH_CONTEXT };
