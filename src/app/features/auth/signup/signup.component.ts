import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private authService = inject(AuthenticationService);
  private dialogRef = inject(MatDialogRef<SignupComponent>);
  private router = inject(Router);

  signupForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  isError = signal(false);

  submit() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;
      this.authService.signup(email, password).subscribe({
        next: (res: any) => {
          if (res?.token) {
            this.authService.setToken(res.token);
          }
          this.dialogRef.close();
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.error('Signup failed', err);
          this.isError.set(true);
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
}
