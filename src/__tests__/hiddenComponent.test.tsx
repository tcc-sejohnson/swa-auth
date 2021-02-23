import React from 'react';
import { DefaultRole, ProvideAuth, Roles } from '../auth/auth';
import { server, rest, DEFAULT_USER } from '../mocks/server';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { cloneDeep } from 'lodash';
import HiddenComponent from '../components/private_components/HiddenComponent';

const SUCCESS_MESSAGE = "Success; you're authorized!";
const RENDER_ON_AUTH = () => <div>{SUCCESS_MESSAGE}</div>;
const AUTHENTICATING_MESSAGE = "You're authenticating, hold on!";
const RENDER_ON_AUTHENTICATING = () => <div>{AUTHENTICATING_MESSAGE}</div>;
const userHandler = (roles: Roles) => {
  const CUSTOM_USER = cloneDeep(DEFAULT_USER);
  CUSTOM_USER.userRoles = roles;
  return rest.get('/.auth/me', (_, res, ctx) => {
    return res(ctx.json({ clientPrincipal: CUSTOM_USER }));
  });
};

describe('HiddenComponent correctly renders based on authorization', () => {
  it('briefly displays the default authenticating message, then displays the children.', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    expect(screen.getByText('Authenticating, please wait...')).toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
  });
  it('briefly displays a custom authenticating message, then displays the children.', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent
          allowedRoles={[DefaultRole.Anonymous]}
          allBut={true}
          authenticatingComponent={<RENDER_ON_AUTHENTICATING />}
        >
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    expect(screen.getByText(AUTHENTICATING_MESSAGE)).toBeInTheDocument();
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
  });
  it('renders its children when the user holds a role other than the roles listed in allowedRoles and allBut == true', async () => {
    const roles = [DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
  });
  it('renders its children when user holds a role other than the roles listed in allowedRoles when allBut == true, even when having a role listed in allowedRoles', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent allowedRoles={[DefaultRole.Anonymous]} allBut={true}>
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
  });
  it('renders its children when user holds a role included in the roles listed in allowedRoles when allBut == false', async () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent allowedRoles={[DefaultRole.Authenticated]}>
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    const hopefullyDiv = await screen.findByText(SUCCESS_MESSAGE);
    expect(hopefullyDiv).toBeInTheDocument();
  });
  it('does not render its children when user does not hold any roles in allowedRoles and allBut == false', () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent allowedRoles={[DefaultRole.GlobalAdmin]}>
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
    expect(hopefullyNotDiv).not.toBeInTheDocument();
  });
  it('does not render its children when user holds only roles in allowedRoles and allBut == true', () => {
    const roles = [DefaultRole.Anonymous, DefaultRole.Authenticated];
    server.use(userHandler(roles));
    render(
      <ProvideAuth>
        <HiddenComponent allowedRoles={[DefaultRole.Anonymous, DefaultRole.Authenticated]} allBut={true}>
          <RENDER_ON_AUTH />
        </HiddenComponent>
      </ProvideAuth>
    );
    const hopefullyNotDiv = screen.queryByText(SUCCESS_MESSAGE);
    expect(hopefullyNotDiv).not.toBeInTheDocument();
  });
});
