import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/api/api-client';
import { Note } from './note.model';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly api = inject(ApiClient);

  list(): Observable<Note[]> {
    return this.api.get<Note[]>('/notes');
  }

  create(title: string, content: string): Observable<Note> {
    return this.api.post<Note>('/notes', { title, content });
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/notes/${id}`);
  }
}
