import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';
import { LocaleNavService } from '../../../core/i18n/locale-nav.service';
import { LocaleLink } from '../../../core/i18n/locale-link';
import { zodValidator } from '../../../core/validators/zod-validator';
import { loginFieldSchemas } from '../../../core/validators/schemas/auth.schemas';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { TextField } from '../../../shared/ui/text-field/text-field';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe, LocaleLink, Button, Card, TextField],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(LocaleNavService);
  private readonly translate = inject(TranslateService);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(loginFieldSchemas.email)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(loginFieldSchemas.password)],
    }),
  });

  submit(): void {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('auth.toasts.loginSuccess'));
        this.nav.navigate('/dashboard');
      },
      error: () => this.toast.error(this.translate.instant('auth.toasts.loginError')),
    });
  }
}
