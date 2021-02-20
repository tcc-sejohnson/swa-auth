import React from 'react';
import { authorize, DefaultRoles, useAuth, User } from '../auth/auth';
// import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { cloneDeep } from 'lodash';
// import { rest } from 'msw';
// import { setupServer } from 'msw/node';

// const server = setupServer();
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
// const AUTH_URL = '/.auth/me';

const DEFAULT_TEST_USER: User = {
  identityProvider: 'Bookface',
  userId: '42',
  userDetails: 'Unremarkable',
  userRoles: [],
};

describe('authorize correctly authorizes users', () => {
  test('User is authorized when holding a role other than a role listed in allowedRoles when allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated];
    const result = authorize([DefaultRoles.Anonymous], user, true);
    expect(result).toStrictEqual(true);
  });
  test('User is authorized when holding a role other than a role listed when allBut == true, even when holding a role listed in allowedRoles', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated, DefaultRoles.Anonymous];
    const result = authorize([DefaultRoles.Anonymous], user, true);
    expect(result).toStrictEqual(true);
  });
  test("User is authorized when holding a role included in the allowedRoles when allBut == false'", () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated];
    const result = authorize([DefaultRoles.Authenticated, DefaultRoles.GlobalAdmin], user);
    expect(result).toStrictEqual(true);
  });
  test('User is denied when not holding any roles in allowedRoles when allBut == false', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated, DefaultRoles.Anonymous];
    const result = authorize([DefaultRoles.GlobalAdmin, DefaultRoles.GlobalViewer], user);
    expect(result).toStrictEqual(false);
  });
  test('User is denied when holding only roles in allowedRoles when allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated, DefaultRoles.Anonymous];
    const result = authorize([DefaultRoles.Authenticated, DefaultRoles.Anonymous], user, true);
    expect(result).toStrictEqual(false);
  });
  test('User is denied when holding any roles when allowedRoles is empty and allBut == false', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated, DefaultRoles.Anonymous];
    const result = authorize([], user, false);
    expect(result).toStrictEqual(false);
  });
  test('User is allowed when holding any roles when allowedRoles is empty and allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    user.userRoles = [DefaultRoles.Authenticated, DefaultRoles.Anonymous];
    const result = authorize([], user, true);
    expect(result).toStrictEqual(true);
  });
  test('User is denied when holding no roles when allowedRoles is empty and allBut == true', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
    const result = authorize([], user, true);
    expect(result).toStrictEqual(false);
  });
  test('User is denied when holding no roles when allowedRoles is empty and allBut == false', () => {
    const user: User = cloneDeep(DEFAULT_TEST_USER);
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
