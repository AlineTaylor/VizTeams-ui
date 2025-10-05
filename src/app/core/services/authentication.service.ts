import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private userSubject = new BehaviorSubject<any | null>(
    this.getUserFromToken()
  );
  user$ = this.userSubject.asObservable();

  // request will now be sent to the API
  constructor(private http: HttpClient, private router: Router) {}

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
    localStorage.setItem('token', token);
    this.userSubject.next(this.getUserFromToken());
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadPart = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadPart));
      return decoded; // includes email or username
    } catch (e) {
      return null;
    }
  }

  // if the value is returned as null/undefined, this will turn them into false, alternatively it will return true
  isLoggedIn() {
    return !!this.getToken();
  }

  logout() {
  localStorage.removeItem('token');
  // Just clear session or reload the app
  window.location.reload();
  }
}
