import { authorize, DefaultRoles, User } from '../auth/auth';
import { cloneDeep } from 'lodash';

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
});
