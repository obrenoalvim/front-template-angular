import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotesService } from './notes.service';
import { API_BASE_URL } from '../../core/config/app-tokens';

describe('NotesService', () => {
  let service: NotesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://api.example.com' },
      ],
    });
    service = TestBed.inject(NotesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() GETs /notes', () => {
    service.list().subscribe((notes) => expect(notes).toHaveLength(1));
    httpMock
      .expectOne('https://api.example.com/notes')
      .flush([{ id: '1', title: 'First', content: 'Body', createdAt: '2026-01-01T00:00:00Z' }]);
  });

  it('create() POSTs the title and content', () => {
    service.create('New', 'Body').subscribe();
    const req = httpMock.expectOne('https://api.example.com/notes');
    expect(req.request.body).toEqual({ title: 'New', content: 'Body' });
    req.flush({ id: '2', title: 'New', content: 'Body', createdAt: '2026-01-02T00:00:00Z' });
  });

  it('remove() DELETEs /notes/:id', () => {
    service.remove('1').subscribe();
    const req = httpMock.expectOne('https://api.example.com/notes/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
