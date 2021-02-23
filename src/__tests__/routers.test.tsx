import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { DefaultRole, Roles } from '../auth/auth';
import { server, rest, DEFAULT_USER } from '../mocks/server';
import AuthMemoryRouter from '../components/router/routers/AuthMemoryRouter';
import HiddenRoute from '../components/router/routes/HiddenRoute';
import ProtectedRoute from '../components/router/routes/ProtectedRoute';
import LoginOrUnauthorizedRedirectRoute from '../components/router/routes/LoginOrUnauthorizedRedirectRoute';
import LoginRedirectRoute from '../components/router/routes/LoginRedirectRoute';
import UnauthorizedRedirectRoute from '../components/router/routes/UnauthorizedRedirectRoute';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { cloneDeep } from 'lodash';

const SUCCESS_MESSAGE = "Success; you're authorized!";
const RENDER_ON_AUTH = () => <div>{SUCCESS_MESSAGE}</div>;
const AUTHENTICATING_MESSAGE = "You're authenticating, hold on!";
const RENDER_ON_AUTHENTICATING = () => <div>{AUTHENTICATING_MESSAGE}</div>;
const LOGIN_MESSAGE = "You're not logged in yet. Redirecting!";
const RENDER_ON_LOGIN = () => <div>{LOGIN_MESSAGE}</div>;
const UNAUTHORIZED_MESSAGE = "You're not allowed. Go away.";
const RENDER_ON_UNAUTHORIZED = () => <div>{UNAUTHORIZED_MESSAGE}</div>;
const userHandler = (roles: Roles) => {
  const CUSTOM_USER = cloneDeep(DEFAULT_USER);
  CUSTOM_USER.userRoles = roles;
  return rest.get('/.auth/me', (_, res, ctx) => {
    return res(ctx.json({ clientPrincipal: CUSTOM_USER }));
  });
};

describe('Randome AuthRouter features work correctly', () => {
  it('handles route bouncing like it should', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <AuthMemoryRouter>
        <ProtectedRoute
          exact
          path="/"
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          redirect={<Redirect to="/redirect1" />}
        >
          <div>Shouldn&apos;t ever land here!</div>
        </ProtectedRoute>
        <ProtectedRoute
          path="/redirect1"
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          redirect={<Redirect to="/redirect2" />}
        >
          <div>Shouldn&apos;t ever land here!</div>
        </ProtectedRoute>
        <ProtectedRoute
          path="/redirect2"
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          redirect={<Redirect to="/redirect3" />}
        >
          <div>Shouldn&apos;t ever land here!</div>
        </ProtectedRoute>
        <ProtectedRoute
          path="/redirect3"
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          redirect={<Redirect to="/redirect4" />}
        >
          <div>Shouldn&apos;t ever land here!</div>
        </ProtectedRoute>
        <ProtectedRoute
          path="/redirect4"
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          redirect={<Redirect to="/redirect5" />}
        >
          <div>Should land here!</div>
        </ProtectedRoute>
        <ProtectedRoute
          path="/redirect5"
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          redirect={<Redirect to="/redirect6" />}
        >
          <div>Shouldn&apos;t ever land here!</div>
        </ProtectedRoute>
      </AuthMemoryRouter>
    );

    expect(await screen.findByText('Should land here!')).toBeInTheDocument();
    expect(screen.queryByText("Shouldn't ever land here!")).not.toBeInTheDocument();
  });
  it('Obeys custom unauthorized routes from the router', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <AuthMemoryRouter unauthorizedRoute="/customUnauthorized">
        <UnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]}>
          <div>Shouldn&apos;t ever see this!</div>
        </UnauthorizedRedirectRoute>
        <Route path="/customUnauthorized">
          <div>Should see this!</div>
        </Route>
      </AuthMemoryRouter>
    );

    expect(await screen.findByText('Should see this!')).toBeInTheDocument();
    expect(screen.queryByText("Shouldn't ever see this!")).not.toBeInTheDocument();
  });
  it('Obeys custom login routes from the router', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <AuthMemoryRouter loginRoute="/customLogin">
        <LoginRedirectRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]}>
          <div>Shouldn&apos;t ever see this!</div>
        </LoginRedirectRoute>
        <Route path="/customLogin">
          <div>Should see this!</div>
        </Route>
      </AuthMemoryRouter>
    );

    expect(await screen.findByText('Should see this!')).toBeInTheDocument();
    expect(screen.queryByText("Shouldn't ever see this!")).not.toBeInTheDocument();
  });
});

describe(`AuthRouter works correctly with all route components`, () => {
  describe("HiddenRoute hides when it should and doesn't when it shouldn't", () => {
    it('briefly displays the default authenticating message, then displays the children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('briefly displays a custom authenticating message, then displays the children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Anonymous]}
            allBut={true}
            authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
          >
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders its children when the user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders its children when user holds a role other than the roles listed in allowedRoles when allBut == true, even when having a role listed in allowedRoles', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders its children when user holds a role included in the roles listed in allowedRoles when allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute exact path="/" allowedRoles={[DefaultRole.Authenticated]}>
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('does not render its children when user does not hold any roles in allowedRoles and allBut == false', () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]}>
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
    it('does not render its children when user holds only roles in allowedRoles and allBut == true', () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <HiddenRoute exact path="/" allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]} allBut={true}>
            <RENDER_ON_AUTH />
          </HiddenRoute>
        </AuthMemoryRouter>
      );
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
  });
  describe("ProtectedRoute renders its children when it should and doesn't when it shouldn't", () => {
    it('briefly displays the default authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Anonymous]}
            allBut={true}
            redirect={<RENDER_ON_UNAUTHORIZED />}
          >
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('briefly displays a custom authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Anonymous]}
            allBut={true}
            authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
            redirect={<RENDER_ON_UNAUTHORIZED />}
          >
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Anonymous]}
            allBut={true}
            redirect={<RENDER_ON_UNAUTHORIZED />}
          >
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true, even when having a role listed in allowedRoles', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Anonymous]}
            allBut={true}
            redirect={<RENDER_ON_UNAUTHORIZED />}
          >
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role included in the roles listed in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Authenticated]}
            redirect={<RENDER_ON_UNAUTHORIZED />}
          >
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders its redirect when user does not hold any roles in allowedRoles and allBut == false', () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]} redirect={<RENDER_ON_UNAUTHORIZED />}>
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
    it('renders its redirect when user holds only roles in allowedRoles and allBut == true', () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <ProtectedRoute
            exact
            path="/"
            allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
            allBut={true}
            redirect={<RENDER_ON_UNAUTHORIZED />}
          >
            <RENDER_ON_AUTH />
          </ProtectedRoute>
        </AuthMemoryRouter>
      );
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
  });
  describe("LoginRedirectRoute renders its children when it should and redirects to the router's default login route when it shouldn't", () => {
    it('briefly displays the default authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('briefly displays a custom authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous]}
              allBut={true}
              authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
            >
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true, even when having a role listed in allowedRoles', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role included in the roles listed in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute exact path="/" allowedRoles={[DefaultRole.Authenticated]}>
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders its redirect when user does not hold any roles in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]}>
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(LOGIN_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
    it('renders its redirect when user holds only roles in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
              allBut={true}
            >
              <RENDER_ON_AUTH />
            </LoginRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(LOGIN_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
  });
  describe("UnauthorizedRedirectRoute renders its children when it should and redirects to the router's default unauthorized route when it shouldn't", () => {
    it('briefly displays the default authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('briefly displays a custom authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous]}
              allBut={true}
              authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
            >
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true, even when having a role listed in allowedRoles', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders children when user holds a role included in the roles listed in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Authenticated]}>
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
    });
    it('renders its redirect when user does not hold any roles in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]}>
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(UNAUTHORIZED_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
    it('renders its redirect when user holds only roles in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <UnauthorizedRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
              allBut={true}
            >
              <RENDER_ON_AUTH />
            </UnauthorizedRedirectRoute>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      const hopefullyDiv = await screen.findByText(UNAUTHORIZED_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
      expect(hopefullyNotDiv).not.toBeInTheDocument();
    });
  });
  describe("LoginOrUnauthorizedRedirectRoute renders its children when it should and redirects to the router's default unauthorized or login route when it shouldn't", () => {
    it('briefly displays the default authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    });
    it('briefly displays a custom authenticating message, then displays its children.', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous]}
              allBut={true}
              authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
            >
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true, even when having a role listed in allowedRoles', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders children when user holds a role included in the roles listed in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.Authenticated]}>
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders its unauthorized redirect when user does not hold any roles in allowedRoles and allBut == false', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute exact path="/" allowedRoles={[DefaultRole.GlobalAdmin]}>
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(UNAUTHORIZED_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders its unauthorized redirect when user holds only roles in allowedRoles and allBut == true', async () => {
      const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
              allBut={true}
            >
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(UNAUTHORIZED_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders its login redirect when user holds no roles roles (i.e. is logged out) and allBut == true', async () => {
      const roles: Roles = [];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute
              exact
              path="/"
              allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
              allBut={true}
            >
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(LOGIN_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    });
    it('renders its login redirect when user holds no roles roles (i.e. is logged out) and allBut == true, even when there are no roles in allowedRoles', async () => {
      const roles: Roles = [];
      server.use(userHandler(roles));
      render(
        <AuthMemoryRouter>
          <Switch>
            <LoginOrUnauthorizedRedirectRoute exact path="/" allowedRoles={[]} allBut={true}>
              <RENDER_ON_AUTH />
            </LoginOrUnauthorizedRedirectRoute>
            <Route path="/login">
              <RENDER_ON_LOGIN />
            </Route>
            <Route path="/unauthorized">
              <RENDER_ON_UNAUTHORIZED />
            </Route>
          </Switch>
        </AuthMemoryRouter>
      );
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
      const hopefullyDiv = await screen.findByText(LOGIN_MESSAGE);
      expect(hopefullyDiv).toBeInTheDocument();
      expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    });
  });
});
