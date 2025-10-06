import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from '../../features/auth/login/login.component';
import { SignupComponent } from '../../features/auth/signup/signup.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  private authService = inject(AuthenticationService);

  user$ = this.authService.user$;

  openDialog() {
    this.dialog.open(LoginComponent, { width: '400px' });
  }

  openSignup() {
    this.dialog.open(SignupComponent, { width: '420px' });
  }

  logout() {
    this.authService.logout();
  }
}
