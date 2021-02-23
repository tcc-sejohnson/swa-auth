import { rest } from 'msw';
import { User, DefaultRole } from '../auth/auth';

const DEFAULT_USER: User = {
  identityProvider: 'aad',
  userId: '420',
  userDetails: 'Unremarkable',
  userRoles: [DefaultRole.Anonymous, DefaultRole.Authenticated],
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

export { handlers, DEFAULT_USER };
