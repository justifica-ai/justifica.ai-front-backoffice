import { APP_ROUTES } from './app-routes';

describe('APP_ROUTES', () => {
  it('should have auth login route', () => {
    expect(APP_ROUTES.AUTH.LOGIN).toBe('/auth/login');
  });

  it('should have admin dashboard route', () => {
    expect(APP_ROUTES.ADMIN.DASHBOARD).toBe('/dashboard');
  });

  it('should have dynamic user detail route', () => {
    expect(APP_ROUTES.ADMIN.USER_DETAIL('abc')).toBe('/users/abc');
  });
});
