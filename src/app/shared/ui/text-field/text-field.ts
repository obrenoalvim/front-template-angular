import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextField), multi: true },
  ],
})
export class TextField implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly type = input<'text' | 'email' | 'password'>('text');
  // eslint-disable-next-line @angular-eslint/no-input-rename -- public API is `error`, internal signal name is more descriptive
  readonly errorMessage = input<string | null>(null, { alias: 'error' });

  protected value = '';
  protected disabled = false;
  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected handleInput(value: string): void {
    this.value = value;
    this.onChange(value);
  }
}
