import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { CdkTableModule } from '@angular/cdk/table';
import { Dialog } from '@angular/cdk/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotesService } from './notes.service';
import { Note } from './note.model';
import { ToastService } from '../../core/toast/toast.service';
import { Button } from '../../shared/ui/button/button';
import { Card } from '../../shared/ui/card/card';
import { TextField } from '../../shared/ui/text-field/text-field';
import { confirmDialog } from '../../shared/ui/dialog/confirm-dialog';

type SortKey = 'title' | 'createdAt';

@Component({
  selector: 'app-notes',
  imports: [
    CommonModule,
    CdkTableModule,
    ReactiveFormsModule,
    TranslatePipe,
    Button,
    Card,
    TextField,
  ],
  templateUrl: './notes.html',
})
export class Notes {
  private readonly notesService = inject(NotesService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(Dialog);

  protected readonly columns = ['title', 'createdAt', 'actions'];
  protected readonly sortKey = signal<SortKey>('createdAt');
  protected readonly sortAsc = signal(false);

  protected readonly notesResource = rxResource({
    stream: () => this.notesService.list(),
  });

  protected readonly sortedNotes = computed<Note[]>(() => {
    const notes = this.notesResource.value() ?? [];
    const key = this.sortKey();
    const dir = this.sortAsc() ? 1 : -1;
    return [...notes].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  });

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update((v) => !v);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  create(): void {
    if (this.form.invalid) return;
    const { title, content } = this.form.getRawValue();
    this.notesService.create(title, content).subscribe({
      next: () => {
        this.form.reset({ title: '', content: '' });
        this.notesResource.reload();
      },
      error: () => this.toast.error(this.translate.instant('auth.toasts.loginError')),
    });
  }

  remove(note: Note): void {
    confirmDialog(this.dialog, {
      title: this.translate.instant('notes.confirmDeleteTitle'),
      body: this.translate.instant('notes.confirmDeleteBody'),
      confirmLabel: this.translate.instant('notes.delete'),
      cancelLabel: this.translate.instant('account.danger.cancelAction'),
    }).subscribe((confirmed) => {
      if (!confirmed) return;
      this.notesService.remove(note.id).subscribe(() => this.notesResource.reload());
    });
  }
}
