import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeriodSelectorComponent, PeriodValue } from './period-selector.component';

describe('PeriodSelectorComponent', () => {
  let component: PeriodSelectorComponent;
  let fixture: ComponentFixture<PeriodSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to 30d', () => {
    expect(component.selected()).toBe('30d');
  });

  it('should have 3 period options', () => {
    expect(component.options.length).toBe(3);
    expect(component.options.map((o) => o.value)).toEqual(['7d', '30d', '90d']);
  });

  it('should emit periodChange on select', () => {
    const emitted: PeriodValue[] = [];
    component.periodChange.subscribe((v: PeriodValue) => emitted.push(v));

    component.select('7d');
    expect(component.selected()).toBe('7d');
    expect(emitted).toEqual(['7d']);
  });

  it('should render 3 radio buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[role="radio"]');
    expect(buttons.length).toBe(3);
  });

  it('should mark selected button as aria-checked true', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[role="radio"]');
    const checked = Array.from(buttons).find(
      (b: unknown) => (b as HTMLElement).getAttribute('aria-checked') === 'true',
    ) as HTMLElement | undefined;
    expect(checked).toBeTruthy();
    expect(checked!.textContent?.trim()).toContain('30 dias');
  });

  it('should return active classes for selected value', () => {
    const classes = component.getButtonClasses('30d');
    expect(classes).toContain('bg-white');
  });

  it('should return inactive classes for non-selected value', () => {
    const classes = component.getButtonClasses('7d');
    expect(classes).toContain('text-gray-500');
    expect(classes).not.toContain('bg-white');
  });
});
