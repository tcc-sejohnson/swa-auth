import { authorize, DefaultRole, User, getUser, DEFAULT_USER as EMPTY_USER } from '../auth/auth';
import { server, rest, DEFAULT_USER } from '../mocks/server';
import '@testing-library/jest-dom/extend-expect';
import { cloneDeep } from 'lodash';

describe('getUser handles varying responses correctly', () => {
  it('responds with a default user when it receives a null response', async () => {
    server.use(
      rest.get('/.auth/me', (_, res, ctx) => {
        return res(ctx.json(null));
      })
    );
    const user = await getUser();
    expect(user).toEqual(EMPTY_USER);
  });
  it('responds with a default user when it receives a valid response but with null json', async () => {
    server.use(
      rest.get('/.auth/me', (_, res, ctx) => {
        return res(ctx.json({ clientPrincipal: null }));
      })
    );
    const user = await getUser();
    expect(user).toEqual(EMPTY_USER);
  });
  it('responds with a correct user when it receives an OK response', async () => {
    const user = await getUser();
    expect(user).toEqual(DEFAULT_USER);
  });
  it("throws 'There was a problem reaching the login service. Please try again later.' when it receives a non-OK response", async () => {
    server.use(
      rest.get('/.auth/me', (_, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    try {
      await getUser();
    } catch (e) {
      expect(e.message).toEqual('There was a problem reaching the login service. Please try again later.');
    }
  });
  it("throws 'There was a problem reading the response from the login service. Please try again later.' when it can't parse the JSON", async () => {
    server.use(
      rest.get('/.auth/me', (_, res, ctx) => {
        return res(ctx.json({ iAmNot: 'the expected response format' }));
      })
    );
    try {
      await getUser();
    } catch (e) {
      expect(e.message).toEqual(
        'There was a problem reading the response from the login service. Please try again later.'
      );
    }
  });
});

describe('authorize correctly authorizes users', () => {
  test('User is authorized when holding a role other than a role listed in allowedRoles when allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated];
    const result = authorize([DefaultRole.Anonymous], user, true);
    expect(result).toStrictEqual(true);
  });
  test('User is authorized when holding a role other than a role listed when allBut == true, even when holding a role listed in allowedRoles', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated, DefaultRole.Anonymous];
    const result = authorize([DefaultRole.Anonymous], user, true);
    expect(result).toStrictEqual(true);
  });
  test("User is authorized when holding a role included in the allowedRoles when allBut == false'", () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated];
    const result = authorize([DefaultRole.Authenticated, DefaultRole.GlobalAdmin], user);
    expect(result).toStrictEqual(true);
  });
  test('User is denied when not holding any roles in allowedRoles when allBut == false', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated, DefaultRole.Anonymous];
    const result = authorize([DefaultRole.GlobalAdmin, DefaultRole.GlobalViewer], user);
    expect(result).toStrictEqual(false);
  });
  test('User is denied when holding only roles in allowedRoles when allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated, DefaultRole.Anonymous];
    const result = authorize([DefaultRole.Authenticated, DefaultRole.Anonymous], user, true);
    expect(result).toStrictEqual(false);
  });
  test('User is denied when holding any roles when allowedRoles is empty and allBut == false', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated, DefaultRole.Anonymous];
    const result = authorize([], user, false);
    expect(result).toStrictEqual(false);
  });
  test('User is allowed when holding any roles when allowedRoles is empty and allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [DefaultRole.Authenticated, DefaultRole.Anonymous];
    const result = authorize([], user, true);
    expect(result).toStrictEqual(true);
  });
  test('User is denied when holding no roles when allowedRoles is empty and allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [];
    const result = authorize([], user, true);
    expect(result).toStrictEqual(false);
  });
  test('User is denied when holding no roles when allowedRoles is empty and allBut == false', () => {
    const user: User = cloneDeep(DEFAULT_USER);
    user.userRoles = [];
    const result = authorize([], user, false);
    expect(result).toStrictEqual(false);
  });
});

// const ContextRenderer = (): JSX.Element => {
//   const auth = useAuth();
//   return <div>{JSON.stringify(auth)}</div>;
// };

//tests on customContext to make sure it correctly overrides context settings

//mock api tests to make sure getUser works correctly
