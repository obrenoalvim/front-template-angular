import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { Card } from '../../shared/ui/card/card';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe, Card],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
}
