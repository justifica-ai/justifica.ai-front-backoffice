import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { SettingsPageComponent } from './settings-page.component';
import { AdminSettingsListResponse } from '../../models/settings.model';

function mockAuthService() {
  return {
    isSuperAdmin: signal(true),
    isAdmin: signal(true),
    role: signal('super_admin'),
    currentUser: signal(null),
    isLoggedIn: signal(true),
  };
}

function buildMockResponse(): AdminSettingsListResponse {
  return {
    data: [
      {
        group: 'pricing',
        settings: [
          { key: 'base_price', value: '49.90', type: 'number', description: 'Preço base do recurso', group: 'pricing', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' },
          { key: 'currency', value: 'BRL', type: 'string', description: 'Moeda padrão', group: 'pricing', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' },
        ],
      },
      {
        group: 'ai',
        settings: [
          { key: 'ai_enabled', value: 'true', type: 'boolean', description: 'Habilitar geração por IA', group: 'ai', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' },
          { key: 'ai_config', value: '{"model":"claude"}', type: 'json', description: 'Configuração JSON da IA', group: 'ai', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' },
        ],
      },
    ],
    total: 4,
  };
}

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;
  let httpTesting: HttpTestingController;
  let authServiceMock: ReturnType<typeof mockAuthService>;

  beforeEach(async () => {
    authServiceMock = mockAuthService();

    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    // Override AuthService with mock
    const { AuthService } = await import('../../../../core/services/auth.service');
    TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    // Flush the initial load from ngOnInit
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush(buildMockResponse());
  });

  it('should load settings on init', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    expect(req.request.method).toBe('GET');
    req.flush(buildMockResponse());

    expect(component.loading()).toBeFalse();
    expect(component.groups().length).toBe(2);
    expect(component.groups()[0].group).toBe('pricing');
    expect(component.groups()[1].group).toBe('ai');
  });

  it('should show loading skeletons while loading', () => {
    expect(component.loading()).toBeFalse();
    fixture.detectChanges(); // triggers ngOnInit → loading=true then HTTP
    // Before flush, loading is in progress
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush(buildMockResponse());
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.animate-pulse').length).toBe(0);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.error(new ProgressEvent('error'));

    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeTruthy();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Não foi possível carregar');
  });

  it('should retry loading on error retry click', () => {
    fixture.detectChanges();
    const req1 = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req1.error(new ProgressEvent('error'));
    fixture.detectChanges();

    component.loadSettings();
    const req2 = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req2.flush(buildMockResponse());

    expect(component.error()).toBeNull();
    expect(component.groups().length).toBe(2);
  });

  it('should sort groups by defined order', () => {
    const reversed: AdminSettingsListResponse = {
      data: [
        { group: 'ai', settings: [{ key: 'ai_enabled', value: 'true', type: 'boolean', description: null, group: 'ai', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' }] },
        { group: 'pricing', settings: [{ key: 'base_price', value: '10', type: 'number', description: null, group: 'pricing', updatedBy: null, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z' }] },
      ],
      total: 2,
    };

    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush(reversed);

    expect(component.groups()[0].group).toBe('pricing');
    expect(component.groups()[1].group).toBe('ai');
  });

  it('should detect changes when editing a value', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush(buildMockResponse());

    expect(component.hasChanges()).toBeFalse();

    const setting = component.groups()[0].settings[0]; // base_price
    component.onValueChange(setting, '59.90');

    expect(setting.dirty).toBeTrue();
    expect(setting.editValue).toBe('59.90');
    expect(component.hasChanges()).toBeTrue();
  });

  it('should validate number type', () => {
    expect(component.validateValue('123', 'number')).toBeNull();
    expect(component.validateValue('12.5', 'number')).toBeNull();
    expect(component.validateValue('abc', 'number')).toBeTruthy();
    expect(component.validateValue('', 'number')).toBeTruthy();
  });

  it('should validate boolean type', () => {
    expect(component.validateValue('true', 'boolean')).toBeNull();
    expect(component.validateValue('false', 'boolean')).toBeNull();
    expect(component.validateValue('yes', 'boolean')).toBeTruthy();
  });

  it('should validate json type', () => {
    expect(component.validateValue('{"a":1}', 'json')).toBeNull();
    expect(component.validateValue('invalid', 'json')).toBeTruthy();
  });

  it('should validate string type (always passes)', () => {
    expect(component.validateValue('anything', 'string')).toBeNull();
    expect(component.validateValue('', 'string')).toBeNull();
  });

  it('should toggle boolean value', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush(buildMockResponse());

    const boolSetting = component.groups()[1].settings[0]; // ai_enabled = 'true'
    component.toggleBoolean(boolSetting);
    expect(boolSetting.editValue).toBe('false');
    expect(boolSetting.dirty).toBeTrue();

    component.toggleBoolean(boolSetting);
    expect(boolSetting.editValue).toBe('true');
    expect(boolSetting.dirty).toBeFalse();
  });

  it('should save changed settings', () => {
    fixture.detectChanges();
    const reqLoad = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    reqLoad.flush(buildMockResponse());

    // Make a change
    const setting = component.groups()[0].settings[0];
    component.onValueChange(setting, '59.90');

    component.saveAll();

    const reqSave = httpTesting.expectOne((r) => r.method === 'PATCH' && r.url.includes('/api/admin/settings'));
    expect(reqSave.request.body).toEqual({ settings: [{ key: 'base_price', value: '59.90' }] });

    reqSave.flush({
      updated: 1,
      settings: [
        { key: 'base_price', value: '59.90', type: 'number', description: 'Preço base do recurso', group: 'pricing', updatedBy: 'admin-1', createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-06-01T12:00:00Z' },
      ],
    });

    expect(component.saving()).toBeFalse();
    expect(component.hasChanges()).toBeFalse();
    expect(component.groups()[0].settings[0].value).toBe('59.90');
  });

  it('should show error toast on save failure', () => {
    fixture.detectChanges();
    const reqLoad = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    reqLoad.flush(buildMockResponse());

    const setting = component.groups()[0].settings[0];
    component.onValueChange(setting, '99.90');

    component.saveAll();

    const reqSave = httpTesting.expectOne((r) => r.method === 'PATCH');
    reqSave.error(new ProgressEvent('error'));

    expect(component.saving()).toBeFalse();
    // Changes should still be dirty so user can retry
    expect(component.hasChanges()).toBeTrue();
  });

  it('should not save when no changes', () => {
    fixture.detectChanges();
    const reqLoad = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    reqLoad.flush(buildMockResponse());

    expect(component.hasChanges()).toBeFalse();
    component.saveAll();
    // No PATCH request should be made
    httpTesting.expectNone((r) => r.method === 'PATCH');
    expect(component.saving()).toBeFalse();
  });

  it('should not save when there are validation errors', () => {
    fixture.detectChanges();
    const reqLoad = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    reqLoad.flush(buildMockResponse());

    const setting = component.groups()[0].settings[0]; // number type
    component.onValueChange(setting, 'abc'); // invalid number

    expect(setting.error).toBeTruthy();
    expect(component.hasErrors()).toBeTrue();

    component.saveAll();
    httpTesting.expectNone((r) => r.method === 'PATCH');
  });

  it('should return correct group label', () => {
    expect(component.getGroupLabel('pricing')).toBe('Preços');
    expect(component.getGroupLabel('ai')).toBe('Inteligência Artificial');
    expect(component.getGroupLabel('unknown_group')).toBe('unknown_group');
    expect(component.getGroupLabel(null)).toBe('Geral');
  });

  it('should return correct type badge class', () => {
    expect(component.getTypeBadgeClass('string')).toContain('blue');
    expect(component.getTypeBadgeClass('number')).toContain('green');
    expect(component.getTypeBadgeClass('boolean')).toContain('purple');
    expect(component.getTypeBadgeClass('json')).toContain('orange');
  });

  it('should format valid JSON', () => {
    expect(component.formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(component.formatJson('invalid')).toBe('invalid');
  });

  it('should show read-only values for non-super-admin', () => {
    authServiceMock.isSuperAdmin.set(false);
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush(buildMockResponse());
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    // Should not contain save button
    expect(compiled.querySelector('button[disabled]')).toBeNull();
    // Should not contain input fields (super_admin check)
    expect(compiled.querySelectorAll('input').length).toBe(0);
    expect(compiled.querySelectorAll('textarea').length).toBe(0);
  });

  it('should show empty state when no settings', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url.includes('/api/admin/settings'));
    req.flush({ data: [], total: 0 });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhuma configuração encontrada');
  });
});
