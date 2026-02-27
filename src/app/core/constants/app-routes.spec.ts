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

  it('should have affiliates route', () => {
    expect(APP_ROUTES.ADMIN.AFFILIATES).toBe('/affiliates');
  });

  it('should have dynamic affiliate detail route', () => {
    expect(APP_ROUTES.ADMIN.AFFILIATE_DETAIL('abc-123')).toBe('/affiliates/abc-123');
  });
});
