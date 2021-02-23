import React from 'react';
import { DefaultRole, ProvideAuth, Roles } from '../../auth/auth';
import { server, rest, DEFAULT_USER } from '../server/server';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { cloneDeep } from 'lodash';
import ProtectedComponent from '../../components/private_components/ProtectedComponent';

const SUCCESS_MESSAGE = "Success; you're authorized!";
const RENDER_ON_AUTH = () => <div>{SUCCESS_MESSAGE}</div>;
const AUTHENTICATING_MESSAGE = "You're authenticating, hold on!";
const RENDER_ON_AUTHENTICATING = () => <div>{AUTHENTICATING_MESSAGE}</div>;
const UNAUTHORIZED_MESSAGE = "You're not allowed. Go away.";
const RENDER_ON_UNAUTHORIZED = () => <div>{UNAUTHORIZED_MESSAGE}</div>;
const userHandler = (roles: Roles) => {
  const CUSTOM_USER = cloneDeep(DEFAULT_USER);
  CUSTOM_USER.userRoles = roles;
  return rest.get('/.auth/me', (_, res, ctx) => {
    return res(ctx.json({ clientPrincipal: CUSTOM_USER }));
  });
};

describe('ProtectedComponent correctly renders based on authorization', () => {
  it('briefly displays the default authenticating message, then displays its children.', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    expect(await screen.findByText(SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
  it('briefly displays a custom authenticating message, then displays its children.', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
    expect(await screen.findByText(SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    expect(await screen.findByText(SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders children when user holds a role other than the roles listed in allowedRoles and allBut == true, even when having a role listed in allowedRoles', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    expect(await screen.findByText(SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders children when user holds a role included in the roles listed in allowedRoles and allBut == false', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent
          allowedRoles={[DefaultRole.Authenticated]}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    expect(await screen.findByText(SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(UNAUTHORIZED_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its unauthorizedComponent when user does not hold any roles in allowedRoles and allBut == false', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent allowedRoles={[DefaultRole.GlobalAdmin]} unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}>
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    expect(await screen.findByText(UNAUTHORIZED_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
  });
  it('renders its unauthorizedComponent when user holds only roles in allowedRoles and allBut == true', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <ProtectedComponent
          allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]}
          allBut={true}
          unauthorizedComponent={<RENDER_ON_UNAUTHORIZED />}
        >
          <RENDER_ON_AUTH />
        </ProtectedComponent>
      </ProvideAuth>
    );
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    expect(await screen.findByText(UNAUTHORIZED_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(SUCCESS_MESSAGE)).not.toBeInTheDocument();
  });
});
