import { TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should return correct classes for success type', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    const component = fixture.componentInstance;
    expect(component.getToastClasses('success')).toContain('bg-accent-50');
  });

  it('should return correct classes for error type', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);
    const component = fixture.componentInstance;
    expect(component.getToastClasses('error')).toContain('bg-red-50');
  });
});
