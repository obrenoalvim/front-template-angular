import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/toast/toast.service';
import { LocaleNavService } from '../../../core/i18n/locale-nav.service';
import { zodValidator } from '../../../core/validators/zod-validator';
import { resetPasswordGroupSchema } from '../../../core/validators/schemas/auth.schemas';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';
import { TextField } from '../../../shared/ui/text-field/text-field';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, TranslatePipe, Button, Card, TextField],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(LocaleNavService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);

  readonly form = new FormGroup(
    {
      password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: zodValidator(resetPasswordGroupSchema) },
  );

  submit(): void {
    if (this.form.invalid) return;
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    const { password } = this.form.getRawValue();
    // AuthService.resetPassword(token, newPassword) — back-template-nest's
    // ResetPasswordDto field is `newPassword`; the form's own field is named
    // `password` for the user-facing label, mapped here at the call site.
    this.auth.resetPassword(token, password).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('auth.toasts.loginSuccess'));
        this.nav.navigate('/login');
      },
      error: () => this.toast.error(this.translate.instant('auth.toasts.loginError')),
    });
  }
}
