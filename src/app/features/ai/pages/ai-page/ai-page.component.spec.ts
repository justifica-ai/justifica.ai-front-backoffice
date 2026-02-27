import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AiPageComponent } from './ai-page.component';
import { environment } from '../../../../../environments/environment';

const providersUrl = `${environment.apiUrl}/api/admin/ai/providers`;
const modelsUrl = `${environment.apiUrl}/api/admin/ai/models`;

describe('AiPageComponent', () => {
  let component: AiPageComponent;
  let fixture: ComponentFixture<AiPageComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AiPageComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushProvidersList(): void {
    const req = httpTesting.expectOne((r) => r.url === providersUrl);
    req.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }

  function flushModelsList(): void {
    // Models page loads providers list + models list
    const provReq = httpTesting.expectOne((r) => r.url === providersUrl);
    provReq.flush({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } });
    const modReq = httpTesting.expectOne((r) => r.url === modelsUrl);
    modReq.flush({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture.detectChanges();
    flushProvidersList();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inteligência Artificial');
  });

  it('should default to providers tab', () => {
    expect(component.activeTab()).toBe('providers');
  });

  it('should show providers tab content by default', () => {
    fixture.detectChanges();
    flushProvidersList();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-ai-providers-page')).toBeTruthy();
    expect(el.querySelector('app-ai-models-page')).toBeFalsy();
  });

  it('should switch to models tab', () => {
    fixture.detectChanges();
    flushProvidersList();

    component.activeTab.set('models');
    fixture.detectChanges();
    flushModelsList();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-ai-models-page')).toBeTruthy();
    expect(el.querySelector('app-ai-providers-page')).toBeFalsy();
  });

  it('should switch back to providers tab', () => {
    fixture.detectChanges();
    flushProvidersList();

    component.activeTab.set('models');
    fixture.detectChanges();
    flushModelsList();

    component.activeTab.set('providers');
    fixture.detectChanges();
    flushProvidersList();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-ai-providers-page')).toBeTruthy();
  });

  it('should render tab buttons', () => {
    fixture.detectChanges();
    flushProvidersList();

    const el = fixture.nativeElement as HTMLElement;
    const buttons = el.querySelectorAll('nav button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Provedores');
    expect(buttons[1].textContent).toContain('Modelos');
  });
});
