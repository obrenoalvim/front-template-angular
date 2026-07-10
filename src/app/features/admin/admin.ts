import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminService } from './admin.service';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-admin',
  imports: [TranslatePipe, Card],
  templateUrl: './admin.html',
})
export class Admin {
  private readonly adminService = inject(AdminService);

  protected readonly usersResource = rxResource({
    stream: () => this.adminService.listUsers(),
  });
}
