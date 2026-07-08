import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Button } from './button';

describe('Button', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('renders projected content and applies the variant class', async () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('variant', 'danger');
    await fixture.whenStable();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList.contains('bg-red-600')).toBe(true);
  });

  it('disables the native button when disabled is true', async () => {
    const fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.disabled).toBe(true);
  });
});
