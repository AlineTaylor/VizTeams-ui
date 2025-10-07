import { Component, signal, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Router } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: '../auth-dialog.css',
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({
    identifier: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  isError: boolean = false;

  private dialogRef = inject(MatDialogRef<LoginComponent>);
  private dialog = inject(MatDialog);

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  login() {
    if (this.loginForm.valid) {
      const identifier = this.loginForm.value.identifier;
      const password = this.loginForm.value.password;

      this.authService.login(identifier, password).subscribe({
        next: (res: any) => {
          if (res?.token) {
            this.authService.setToken(res.token);
          }
          this.dialogRef.close();
        },
        error: (error: any) => {
          console.log('Error when logging in', error);
          this.isError = true;
        },
      });
    }
  }

  // Password visibility toggle
  hide = signal(true);
  togglePasswordVisibility(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.hide.update((v) => !v);
  }

  openSignup() {
    this.dialogRef.close();
    this.dialog.open(SignupComponent);
  }
}
