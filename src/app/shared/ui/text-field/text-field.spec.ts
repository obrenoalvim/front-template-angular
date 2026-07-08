import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TextField } from './text-field';

@Component({
  imports: [TextField, ReactiveFormsModule],
  template: `<app-text-field label="Email" [formControl]="control" />`,
})
class HostComponent {
  control = new FormControl('', { nonNullable: true });
}

describe('TextField', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  it('writes the FormControl value into the native input', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setValue('a@b.com');
    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(input.value).toBe('a@b.com');
  });

  it('propagates native input changes back into the FormControl', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'new@value.com';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('new@value.com');
  });
});
