import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminAiService } from './admin-ai.service';
import { environment } from '../../../../environments/environment';

describe('AdminAiService', () => {
  let service: AdminAiService;
  let httpTesting: HttpTestingController;

  const providersUrl = `${environment.apiUrl}/api/admin/ai/providers`;
  const modelsUrl = `${environment.apiUrl}/api/admin/ai/models`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminAiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ═══════ Providers ═══════

  describe('listProviders', () => {
    it('should list providers with default params', () => {
      service.listProviders({ page: 1, limit: 20 }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === providersUrl && r.params.get('page') === '1' && r.params.get('limit') === '20',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });

    it('should list providers with status filter', () => {
      service.listProviders({ page: 1, limit: 10, status: 'active' }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === providersUrl && r.params.get('status') === 'active',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    });

    it('should not send status param when not provided', () => {
      service.listProviders({ page: 1, limit: 20 }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === providersUrl && !r.params.has('status'),
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });
  });

  describe('getProviderById', () => {
    it('should get provider by id', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      service.getProviderById(id).subscribe();
      const req = httpTesting.expectOne(`${providersUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({ id, name: 'Anthropic' });
    });
  });

  describe('createProvider', () => {
    it('should create provider', () => {
      const body = { name: 'Anthropic', slug: 'anthropic', status: 'active' as const, priority: 1 };
      service.createProvider(body).subscribe();
      const req = httpTesting.expectOne(providersUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ id: 'new-id', name: 'Anthropic', slug: 'anthropic', status: 'active', priority: 1, createdAt: '2025-01-01T00:00:00.000Z' });
    });
  });

  describe('updateProvider', () => {
    it('should update provider', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const body = { status: 'maintenance' as const };
      service.updateProvider(id, body).subscribe();
      const req = httpTesting.expectOne(`${providersUrl}/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush({ id, name: 'Anthropic', slug: 'anthropic', status: 'maintenance', priority: 1, updatedAt: '2025-01-01T00:00:00.000Z' });
    });
  });

  describe('deleteProvider', () => {
    it('should delete provider', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      service.deleteProvider(id).subscribe();
      const req = httpTesting.expectOne(`${providersUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, id });
    });
  });

  describe('testConnection', () => {
    it('should test provider connection', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      service.testConnection(id).subscribe();
      const req = httpTesting.expectOne(`${providersUrl}/${id}/test-connection`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ success: true, provider: 'anthropic', latencyMs: 120, error: null });
    });
  });

  // ═══════ Models ═══════

  describe('listModels', () => {
    it('should list models with default params', () => {
      service.listModels({ page: 1, limit: 20 }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === modelsUrl && r.params.get('page') === '1' && r.params.get('limit') === '20',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });

    it('should list models with providerId filter', () => {
      const providerId = '550e8400-e29b-41d4-a716-446655440000';
      service.listModels({ page: 1, limit: 20, providerId }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === modelsUrl && r.params.get('providerId') === providerId,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });

    it('should list models with active filter', () => {
      service.listModels({ page: 1, limit: 20, active: 'true' }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === modelsUrl && r.params.get('active') === 'true',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });

    it('should not send optional params when not provided', () => {
      service.listModels({ page: 1, limit: 20 }).subscribe();
      const req = httpTesting.expectOne(
        (r) => r.url === modelsUrl && !r.params.has('providerId') && !r.params.has('active'),
      );
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    });
  });

  describe('getModelById', () => {
    it('should get model by id', () => {
      const id = '660e8400-e29b-41d4-a716-446655440000';
      service.getModelById(id).subscribe();
      const req = httpTesting.expectOne(`${modelsUrl}/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({ id, name: 'Claude Opus 4' });
    });
  });

  describe('createModel', () => {
    it('should create model', () => {
      const body = {
        providerId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Claude Opus 4',
        slug: 'claude-opus-4-20250514',
        maxTokens: 4096,
        priority: 1,
        isActive: true,
      };
      service.createModel(body).subscribe();
      const req = httpTesting.expectOne(modelsUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush({ id: 'new-id', name: 'Claude Opus 4', slug: 'claude-opus-4-20250514', providerId: body.providerId, priority: 1, isActive: true, createdAt: '2025-01-01T00:00:00.000Z' });
    });
  });

  describe('updateModel', () => {
    it('should update model', () => {
      const id = '660e8400-e29b-41d4-a716-446655440000';
      const body = { isActive: false };
      service.updateModel(id, body).subscribe();
      const req = httpTesting.expectOne(`${modelsUrl}/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush({ id, name: 'Claude Opus 4', slug: 'claude-opus-4-20250514', priority: 1, isActive: false, updatedAt: '2025-01-01T00:00:00.000Z' });
    });
  });

  describe('deleteModel', () => {
    it('should delete model', () => {
      const id = '660e8400-e29b-41d4-a716-446655440000';
      service.deleteModel(id).subscribe();
      const req = httpTesting.expectOne(`${modelsUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, id });
    });
  });

  describe('reorderModels', () => {
    it('should reorder models', () => {
      const body = { models: [{ id: 'id1', priority: 1 }, { id: 'id2', priority: 2 }] };
      service.reorderModels(body).subscribe();
      const req = httpTesting.expectOne(`${modelsUrl}/reorder`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush({ success: true, updated: 2 });
    });
  });
});
