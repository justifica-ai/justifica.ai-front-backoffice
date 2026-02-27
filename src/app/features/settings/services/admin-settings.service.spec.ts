import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsListResponse, AdminSettingsUpdateResponse } from '../models/settings.model';

describe('AdminSettingsService', () => {
  let service: AdminSettingsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminSettingsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list all settings without group filter', () => {
    const mockResponse: AdminSettingsListResponse = {
      data: [
        {
          group: 'pricing',
          settings: [
            { key: 'base_price', value: '49.90', type: 'number', description: 'Preço base', group: 'pricing', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' },
          ],
        },
      ],
      total: 1,
    };

    service.listSettings().subscribe((res) => {
      expect(res.total).toBe(1);
      expect(res.data.length).toBe(1);
      expect(res.data[0].group).toBe('pricing');
    });

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings') && !r.params.has('group'));
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should list settings with group filter', () => {
    const mockResponse: AdminSettingsListResponse = { data: [], total: 0 };

    service.listSettings('pricing').subscribe((res) => {
      expect(res.total).toBe(0);
    });

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings') && r.params.get('group') === 'pricing');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update settings', () => {
    const mockResponse: AdminSettingsUpdateResponse = {
      updated: 1,
      settings: [
        { key: 'base_price', value: '59.90', type: 'number', description: 'Preço base', group: 'pricing', updatedBy: 'admin-1', createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-06-01T12:00:00Z' },
      ],
    };

    service.updateSettings({ settings: [{ key: 'base_price', value: '59.90' }] }).subscribe((res) => {
      expect(res.updated).toBe(1);
      expect(res.settings[0].value).toBe('59.90');
    });

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings') && r.method === 'PATCH');
    expect(req.request.body).toEqual({ settings: [{ key: 'base_price', value: '59.90' }] });
    req.flush(mockResponse);
  });
});
