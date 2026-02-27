import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminUsersService } from './admin-users.service';
import { environment } from '../../../../environments/environment';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminUsersService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list users with default params', () => {
    service.listUsers().subscribe();
    const req = httpTesting.expectOne(`${environment.apiUrl}/api/admin/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list users with filters', () => {
    service.listUsers({ page: 2, limit: 10, q: 'john', status: 'active', role: 'user' }).subscribe();
    const req = httpTesting.expectOne((r) => {
      return (
        r.url === `${environment.apiUrl}/api/admin/users` &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '10' &&
        r.params.get('q') === 'john' &&
        r.params.get('status') === 'active' &&
        r.params.get('role') === 'user'
      );
    });
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], pagination: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should get user by id', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.getUserById(id).subscribe();
    const req = httpTesting.expectOne(`${environment.apiUrl}/api/admin/users/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should update user', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.updateUser(id, { status: 'suspended' }).subscribe();
    const req = httpTesting.expectOne(`${environment.apiUrl}/api/admin/users/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'suspended' });
    req.flush({});
  });

  it('should delete user', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    service.deleteUser(id).subscribe();
    const req = httpTesting.expectOne(`${environment.apiUrl}/api/admin/users/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
