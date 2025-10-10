import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private userSubject = new BehaviorSubject<any | null>(
    this.getUserFromToken()
  );
  user$ = this.userSubject.asObservable();

  private logoutTimer: any | null = null;

  // request will now be sent to the API
  constructor(
    private http: HttpClient,
    private router: Router,
    private snack: MatSnackBar
  ) {
    // Clean up any legacy localStorage token from previous builds
    try {
      localStorage.removeItem('token');
    } catch {}

    // Schedule auto-logout when valid token is found on init
    const token = sessionStorage.getItem('token');
    if (token && !this.isTokenExpired(token)) {
      const exp = this.getExpiryFromToken(token);
      if (exp) this.scheduleAutoLogout(exp);
    }
  }

  private pendingRedirect: string | null = null;
  setPendingRedirect(url: string) {
    this.pendingRedirect = url;
  }
  consumeRedirect(): string | null {
    const u = this.pendingRedirect;
    this.pendingRedirect = null;
    return u;
  }

  login(identifier: string, password: string) {
    const isEmail = identifier.includes('@');
    const body: any = { password };
    if (isEmail) {
      body.email = identifier.toLowerCase();
    } else {
      body.username = identifier;
    }
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/login`,
      body
    );
  }

  signup(email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/signup`, {
      email,
      password,
    });
  }

  setToken(token: string) {
    // Store auth token in sessionStorage so it clears when the tab/window closes
    sessionStorage.setItem('token', token);

    // If JWT has an exp claim, we rely on it. Otherwise set a fallback 1-hour expiry timestamp (just in case - we're thorough around here)
    const expMs = this.getExpiryFromToken(token) ?? Date.now() + 60 * 60 * 1000;
    sessionStorage.setItem('token_exp', String(expMs));

    this.userSubject.next(this.getUserFromToken());

    // Schedule auto-logout at expiry
    this.scheduleAutoLogout(expMs);
    // After token is set, navigate to the stored redirect target if there was one (currently set to be the teams layout page)
    const target = this.consumeRedirect();
    if (target) {
      this.router.navigateByUrl(target);
    } else {
      // Default post-auth destination when user logged in from public landing or header
      this.router.navigate(['/teams']);
    }
  }

  getToken() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    if (this.isTokenExpired(token)) {
      this.logout('expired');
      return null;
    }
    return token;
  }

  private getUserFromToken() {
    const token = sessionStorage.getItem('token');
    if (!token || this.isTokenExpired(token)) return null;
    try {
      const payloadPart = token.split('.')[1];
      const decoded = JSON.parse(this.base64UrlDecode(payloadPart));
      return decoded; // includes email or username
    } catch (e) {
      return null;
    }
  }

  // if the value is returned as null/undefined, this will turn them into false, alternatively it will return true
  isLoggedIn() {
    return !!this.getToken();
  }

  logout(reason: 'manual' | 'expired' | 'unauthorized' = 'manual') {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_exp');
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    this.userSubject.next(null);
    // Notify user unless it's a manual logout
    if (reason !== 'manual') {
      const message =
        reason === 'expired'
          ? 'Your session has expired. Please sign in again.'
          : 'Your session is no longer valid. Please sign in again.';
      this.snack.open(message, 'Dismiss', {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
    // Navigate to public landing page, user is automatically removed from protected view
    this.router.navigate(['/']);
  }

  private getExpiryFromToken(token: string): number | null {
    try {
      const payloadPart = token.split('.')[1];
      const decoded = JSON.parse(this.base64UrlDecode(payloadPart));
      // Standard JWT exp is in seconds, allegedly
      if (decoded && typeof decoded.exp === 'number') {
        return decoded.exp * 1000;
      }
    } catch {}
    // Fallback to stored timestamp if present
    const stored = sessionStorage.getItem('token_exp');
    return stored ? Number(stored) : null;
  }

  private isTokenExpired(token: string): boolean {
    const expMs = this.getExpiryFromToken(token) ?? 0;
    return expMs !== 0 && Date.now() >= expMs;
  }

  private scheduleAutoLogout(expMs: number) {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    const delay = Math.max(0, expMs - Date.now());
    this.logoutTimer = setTimeout(() => this.logout('expired'), delay);
  }

  private base64UrlDecode(input: string): string {
    // Convert base64url to base64 and decode
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    // Pad string length to a multiple of 4
    const pad = input.length % 4;
    if (pad) input += '='.repeat(4 - pad);
    return atob(input);
  }
}
