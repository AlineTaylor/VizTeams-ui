import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from '../../features/auth/login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../core/services/authentication.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [SharedModule, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  private authService = inject(AuthenticationService);

  user$ = this.authService.user$;

  openDialog() {
    this.dialog.open(LoginComponent);
  }

  logout() {
    this.authService.logout();
  }
}
