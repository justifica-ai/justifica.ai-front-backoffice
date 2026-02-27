import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BadgeComponent } from './badge.component';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `<app-badge [label]="label" [colorClass]="colorClass" />`,
})
class TestHostComponent {
  label = 'Ativo';
  colorClass = 'bg-green-100 text-green-800';
}

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.nativeElement.querySelector('app-badge')).toBeTruthy();
  });

  it('should display label', () => {
    expect(fixture.nativeElement.textContent).toContain('Ativo');
  });

  it('should apply color class', () => {
    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-green-100');
    expect(span.className).toContain('text-green-800');
  });
});
