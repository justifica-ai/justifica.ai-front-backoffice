import { API_ROUTES } from './api-routes';

describe('API_ROUTES', () => {
  it('should have admin dashboard route', () => {
    expect(API_ROUTES.ADMIN.DASHBOARD).toBe('/admin/dashboard');
  });

  it('should have users route with dynamic id', () => {
    expect(API_ROUTES.USERS.BY_ID('123')).toBe('/admin/users/123');
  });

  it('should have settings route with dynamic key', () => {
    expect(API_ROUTES.SETTINGS.BY_KEY('site_name')).toBe('/admin/settings/site_name');
  });
});
