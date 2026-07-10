import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/api/api-client';
import { AdminUser } from './admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiClient);

  listUsers(): Observable<AdminUser[]> {
    return this.api.get<AdminUser[]>('/admin/users');
  }
}
