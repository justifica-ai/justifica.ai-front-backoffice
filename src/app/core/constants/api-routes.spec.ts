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

  it('should have affiliates base route', () => {
    expect(API_ROUTES.AFFILIATES.BASE).toBe('/admin/affiliates');
  });

  it('should have affiliate by id route', () => {
    expect(API_ROUTES.AFFILIATES.BY_ID('abc-123')).toBe('/admin/affiliates/abc-123');
  });

  it('should have pending withdrawals route', () => {
    expect(API_ROUTES.AFFILIATES.PENDING_WITHDRAWALS).toBe('/admin/affiliates/withdrawals/pending');
  });

  it('should have process withdrawal route', () => {
    expect(API_ROUTES.AFFILIATES.PROCESS_WITHDRAWAL('aff-1', 'wd-1')).toBe(
      '/admin/affiliates/aff-1/withdrawals/wd-1',
    );
  });
});
