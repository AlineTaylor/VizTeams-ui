import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from '../../features/auth/login/login.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  imports: [SharedModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(LoginComponent);
  }
}
