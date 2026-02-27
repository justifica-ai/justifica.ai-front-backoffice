import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { KpiCardComponent } from './kpi-card.component';

@Component({
  standalone: true,
  imports: [KpiCardComponent],
  template: `
    <app-kpi-card
      label="Receita"
      value="R$ 1.000,00"
      [variationPercent]="variation"
      [subtitle]="subtitle"
    />
  `,
})
class TestHostComponent {
  variation: number | null = 12.5;
  subtitle = '30 dias';
}

describe('KpiCardComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    const card = hostFixture.nativeElement.querySelector('app-kpi-card');
    expect(card).toBeTruthy();
  });

  it('should display label', () => {
    const el = hostFixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Receita');
  });

  it('should display value', () => {
    const el = hostFixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('R$ 1.000,00');
  });

  it('should display positive variation with up arrow', () => {
    const el = hostFixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('12.5%');
    const svg = el.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should display subtitle', () => {
    const el = hostFixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('30 dias');
  });

  it('should display negative variation', () => {
    hostComponent.variation = -8.3;
    hostFixture.detectChanges();
    const el = hostFixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('8.3%');
  });

  it('should not display variation when null', () => {
    hostComponent.variation = null;
    hostFixture.detectChanges();
    const el = hostFixture.nativeElement as HTMLElement;
    const variationBadge = el.querySelector('.inline-flex');
    expect(variationBadge).toBeNull();
  });

  it('should format variation correctly', () => {
    const cardFixture = TestBed.createComponent(KpiCardComponent);
    // Need to set required inputs via componentRef
    cardFixture.componentRef.setInput('label', 'Test');
    cardFixture.componentRef.setInput('value', '100');
    cardFixture.componentRef.setInput('variationPercent', 5.678);
    const card = cardFixture.componentInstance;
    expect(card.formatVariation(5.678)).toBe('5.7%');
    expect(card.formatVariation(-3.2)).toBe('3.2%');
  });
});
