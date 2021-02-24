import React, { useContext, createContext, useState, useEffect } from 'react';

const DEFAULT_USER: User = {
  identityProvider: '',
  userId: '',
  userDetails: '',
  userRoles: [],
};

const DEFAULT_AUTH_CONTEXT: AuthorizationContext = {
  user: DEFAULT_USER,
  isAuthenticating: true,
  isLoggedIn: false,
  loginAAD: async (): Promise<void> => Promise.resolve(),
  loginFacebook: async (): Promise<void> => Promise.resolve(),
  loginGitHub: async (): Promise<void> => Promise.resolve(),
  loginGoogle: async (): Promise<void> => Promise.resolve(),
  loginTwitter: async (): Promise<void> => Promise.resolve(),
  logOut: () => {
    return;
  },
};

/**
 * A set of default roles you can use to authorize your users.
 * Want to make your own? Sure! Just declare your own enum.
 * You can also union your enum with this one to "inherit" its members.
 * Here's an example:
 * import { DefaultRole } from 'swa-auth';
 * enum CustomRoles {
 *   MyPrivatePageRole = 'my_private_page_role',
 * }
 * export const MyAppRoles = { ...CustomRoles, ...DefaultRoles };
 * export type MyAppRoles = typeof MyAppRoles;
 */
export enum DefaultRole {
  Authenticated = 'authenticated',
  Anonymous = 'anonymous',
  GlobalAdmin = 'global_admin',
  GlobalViewer = 'global_viewer',
}

export enum LoginProvider {
  AAD = 'aad',
  Facebook = 'facebook',
  GitHub = 'github',
  Google = 'google',
  Twitter = 'twitter',
}

/**
 * The settings used for the authorization library.
 */
export interface AuthorizationContext {
  user: User;
  isAuthenticating: boolean;
  isLoggedIn: boolean;
  loginAAD: () => Promise<void>;
  loginFacebook: () => Promise<void>;
  loginGitHub: () => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginTwitter: () => Promise<void>;
  logOut: () => void;
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

const authContext = createContext<AuthorizationContext>(DEFAULT_AUTH_CONTEXT);

const getUser = async (): Promise<User> => {
  const resp = await fetch(`/.auth/me`);
  if (!resp.ok) {
    throw Error('There was a problem reaching the login service. Please try again later.');
  }
  const json = await resp.json();
  try {
    if (json?.clientPrincipal === undefined || json.clientPrincipal === null) {
      return DEFAULT_USER;
    }
    const user: User = json.clientPrincipal;
    return user;
  } catch (e) {
    throw Error('There was a problem reading the response from the login service. Please try again later.');
  }
};

export interface ProvideAuthProps {
  disallowedLoginProviders?: LoginProvider[];
  children: React.ReactNode;
}

/**
 * Wrap components in this element to give them access to useAuth.
 * If you want your whole app to be access-controlled, wrapp your App component.
 * Any component using useAuth will have access to the full AuthorizationContext.
 * If a customContext is provided, it will override the default context on initialization.
 */
const ProvideAuth = ({ disallowedLoginProviders, children }: ProvideAuthProps): JSX.Element => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [isLoggedIn, setIsLoggedIn] = useState(DEFAULT_AUTH_CONTEXT.isLoggedIn);
  const [isAuthenticating, setIsAuthenticating] = useState(DEFAULT_AUTH_CONTEXT.isAuthenticating);

  const forwardToAuth = (uri: string): void => {
    const url = `${window.location.origin}/.auth/${uri}`;
    window.location.assign(url);
  };

  const login = async (provider: LoginProvider): Promise<void> => {
    if (disallowedLoginProviders?.includes(provider) ?? false) {
      throw Error('Logins with this provider have been disabled by site owner.');
    }
    if (isLoggedIn) {
      await refreshInternalUserState();
    } else {
      forwardToAuth(`login/${provider}`);
    }
  };

  const loginAAD = async (): Promise<void> => {
    login(LoginProvider.AAD);
  };

  const loginFacebook = async (): Promise<void> => {
    login(LoginProvider.Facebook);
  };

  const loginGitHub = async (): Promise<void> => {
    login(LoginProvider.GitHub);
  };

  const loginGoogle = async (): Promise<void> => {
    login(LoginProvider.Google);
  };

  const loginTwitter = async (): Promise<void> => {
    login(LoginProvider.Twitter);
  };

  const logOut = () => {
    forwardToAuth('logout');
  };

  const refreshInternalUserState = async () => {
    setIsAuthenticating(true);
    const newUser = await getUser();
    setUser(newUser);
    setIsAuthenticating(false);
  };

  useEffect(() => {
    refreshInternalUserState();
    return () => setUser(DEFAULT_USER);
  }, []);

  useEffect(() => {
    if (user.userRoles.length > 0) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [user]);

  const ctx: AuthorizationContext = {
    user,
    isAuthenticating,
    isLoggedIn,
    loginAAD,
    loginFacebook,
    loginGitHub,
    loginGoogle,
    loginTwitter,
    logOut,
  };
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

export { ProvideAuth, useAuth, authorize, getUser, DEFAULT_AUTH_CONTEXT, DEFAULT_USER };
