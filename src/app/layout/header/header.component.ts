import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from '../../features/auth/login/login.component';
import { SignupComponent } from '../../features/auth/signup/signup.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../core/services/authentication.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SharedModule, MatTooltipModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  private authService = inject(AuthenticationService);

  user$ = this.authService.user$;

  onLogoClick() {
    window.location.reload();
  }

  openLogin() {
    this.dialog.open(LoginComponent);
  }

  openSignup() {
    this.dialog.open(SignupComponent);
  }

  logout() {
    this.authService.logout();
  }
}
