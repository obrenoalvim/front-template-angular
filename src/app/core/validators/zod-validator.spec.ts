// src/app/core/validators/zod-validator.spec.ts
import { FormControl } from '@angular/forms';
import { z } from 'zod';
import { zodValidator } from './zod-validator';

describe('zodValidator', () => {
  const emailSchema = z.string().min(1, 'validation.required').email('validation.invalidEmail');

  it('returns null when the value satisfies the schema', () => {
    const control = new FormControl('a@b.com', zodValidator(emailSchema));
    expect(control.errors).toBeNull();
  });

  it('returns { zod: <translationKey> } for the first failing issue', () => {
    const control = new FormControl('not-an-email', zodValidator(emailSchema));
    expect(control.errors).toEqual({ zod: 'validation.invalidEmail' });
  });

  it('reports the required-field key for an empty value', () => {
    const control = new FormControl('', zodValidator(emailSchema));
    expect(control.errors).toEqual({ zod: 'validation.required' });
  });
});
