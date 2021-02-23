import { rest } from 'msw';
import { User, DefaultRole, Roles } from '../auth/auth';
import { cloneDeep } from 'lodash';

const DEFAULT_USER: User = {
  identityProvider: 'aad',
  userId: '420',
  userDetails: 'Unremarkable',
  userRoles: [DefaultRole.Anonymous, DefaultRole.Authenticated],
};

const userHandler = (roles: Roles) => {
  const CUSTOM_USER = cloneDeep(DEFAULT_USER);
  CUSTOM_USER.userRoles = roles;
  return rest.get('/.auth/me', (_, res, ctx) => {
    return res(ctx.json({ clientPrincipal: CUSTOM_USER }));
  });
};

const handlers = [
  rest.get('/.auth/me', async (_, res, ctx) => {
    return res(ctx.delay(1000), ctx.json({ clientPrincipal: DEFAULT_USER }));
  }),
  // ...Object.values(LoginProvider).map((provider) => {
  //   return rest.get(`/.auth/login/${provider}`, async (_, res, ctx) => {
  //     return res(ctx.json({ value: `Success! Logged in with ${provider}.` }));
  //   });
  // }),
];

export { handlers, userHandler, DEFAULT_USER };
