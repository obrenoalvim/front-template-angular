import { Component, inject } from '@angular/core';
import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { Button } from '../button/button';
import { DialogPanel } from './dialog-panel';

export interface ConfirmDialogData {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [Button, DialogPanel],
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  private readonly ref = inject(DialogRef<boolean>);

  confirm(): void {
    this.ref.close(true);
  }

  cancel(): void {
    this.ref.close(false);
  }
}

export function confirmDialog(dialog: Dialog, data: ConfirmDialogData): Observable<boolean> {
  return dialog.open<boolean, ConfirmDialogData>(ConfirmDialog, { data })
    .closed as Observable<boolean>;
}
