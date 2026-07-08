// src/app/core/validators/zod-validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ZodType } from 'zod';

export function zodValidator(schema: ZodType): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);
    if (result.success) return null;
    return { zod: result.error.issues[0].message };
  };
}
