import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { zodValidator } from '../../../core/validators/zod-validator';
import { forgotPasswordFieldSchemas } from '../../../core/validators/schemas/auth.schemas';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { TextField } from '../../../shared/ui/text-field/text-field';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, TranslatePipe, Button, Card, TextField],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly auth = inject(AuthService);
  readonly sent = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(forgotPasswordFieldSchemas.email)],
    }),
  });

  submit(): void {
    if (this.form.invalid) return;
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe(() => this.sent.set(true));
  }
}
