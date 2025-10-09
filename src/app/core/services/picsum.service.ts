import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class PicsumService {
  private apiUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}

  getPhotos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
