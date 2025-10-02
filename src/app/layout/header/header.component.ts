import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
  selector: 'app-header',
  imports: [SharedModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private authService:AuthenticationService) {  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
  }
}
