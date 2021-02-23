import React from 'react';
import { DefaultRole, ProvideAuth, Roles } from '../auth/auth';
import { server, rest, DEFAULT_USER } from '../mocks/server';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { cloneDeep } from 'lodash';
import LoginOrUnauthorizedComponent from '../components/private_components/LoginOrUnauthorizedComponent';

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

describe('LoginOrUnauthorizedComponent correctly renders based on authorization', () => {
  it('briefly displays the default authenticating message, then displays its children.', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('briefly displays a custom authenticating message, then displays its children.', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders children when the user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its children when the user holds a role other than the roles listed in allowedRoles and allBut == true, even when having a role listed in allowedRoles', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its children when the user holds a role included in the roles listed in allowedRoles and allBut == false', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Authenticated]}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its unauthorizedComponent when the user does not hold any roles in allowedRoles, is logged in, and allBut == false', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.GlobalAdmin]}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    expect(await screen.findByText(UNAUTHORIZED_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its unauthorizedComponent when user holds only roles in allowedRoles, is logged in, and allBut == true', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
    expect(await screen.findByText(UNAUTHORIZED_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOGIN_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its loginComponent when the user holds no roles (i.e. is logged out) and allBut == true', async () => {
    const roles: Roles = [];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(await screen.findByText(LOGIN_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its loginComponent when the user holds no roles (i.e. is logged out) and allBut == true, even when the allowedRoles array is empty', async () => {
    const roles: Roles = [];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <LoginOrUnauthorizedComponent
          allowedRoles={[]}
          allBut={true}
          loginComponent={<RENDER_ON_LOGIN />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </LoginOrUnauthorizedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(await screen.findByText(LOGIN_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
});
