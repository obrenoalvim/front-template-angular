import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';
import { LocaleNavService } from '../../../core/i18n/locale-nav.service';
import { LocaleLink } from '../../../core/i18n/locale-link';
import { zodValidator } from '../../../core/validators/zod-validator';
import { registerFieldSchemas } from '../../../core/validators/schemas/auth.schemas';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { TextField } from '../../../shared/ui/text-field/text-field';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TranslatePipe, LocaleLink, Button, Card, TextField],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(LocaleNavService);
  private readonly translate = inject(TranslateService);

  // No `name` field: back-template-nest's User has no name column and
  // RegisterDto only accepts email/password (its ValidationPipe rejects any
  // extra property outright — forbidNonWhitelisted: true).
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(registerFieldSchemas.email)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(registerFieldSchemas.password)],
    }),
  });

  submit(): void {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    // register() returns no token (back-template-nest requires email
    // verification as a separate step, not auto-login) — send the user to
    // the login page instead of a protected route.
    this.auth.register(email, password).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('auth.toasts.registerSuccess'));
        this.nav.navigate('/login');
      },
      error: () => this.toast.error(this.translate.instant('auth.toasts.registerError')),
    });
  }
}
