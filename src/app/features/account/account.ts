import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/toast/toast.service';
import { LocaleNavService } from '../../core/i18n/locale-nav.service';
import { zodValidator } from '../../core/validators/zod-validator';
import {
  changePasswordGroupSchema,
  passwordSchema,
} from '../../core/validators/schemas/auth.schemas';
import { Button } from '../../shared/ui/button/button';
import { Card } from '../../shared/ui/card/card';
import { TextField } from '../../shared/ui/text-field/text-field';
import { confirmDialog } from '../../shared/ui/dialog/confirm-dialog';

// No profile/name form here: back-template-nest's User model has no `name`
// column and no endpoint to update one — only change-password and
// delete-account are real, backed operations (see AuthService, Task 13).
@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule, TranslatePipe, Button, Card, TextField],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly nav = inject(LocaleNavService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(Dialog);

  readonly passwordForm = new FormGroup(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: zodValidator(changePasswordGroupSchema) },
  );

  // back's DeleteAccountDto requires the password in the request body —
  // ConfirmDialog (Task 10) only returns a yes/no, so the password is
  // collected here on the page itself, then confirmed via the dialog.
  readonly deleteForm = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, zodValidator(passwordSchema)],
    }),
  });

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('account.password.success'));
        this.passwordForm.reset();
      },
      error: () => this.toast.error(this.translate.instant('auth.toasts.loginError')),
    });
  }

  deleteAccount(): void {
    if (this.deleteForm.invalid) return;
    confirmDialog(this.dialog, {
      title: this.translate.instant('account.danger.confirmTitle'),
      body: this.translate.instant('account.danger.confirmBody'),
      confirmLabel: this.translate.instant('account.danger.confirmAction'),
      cancelLabel: this.translate.instant('account.danger.cancelAction'),
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      const { password } = this.deleteForm.getRawValue();
      this.auth.deleteAccount(password).subscribe({
        next: () => {
          this.toast.success(this.translate.instant('account.danger.success'));
          this.nav.navigate('/');
        },
        error: () => this.toast.error(this.translate.instant('auth.toasts.loginError')),
      });
    });
  }
}
