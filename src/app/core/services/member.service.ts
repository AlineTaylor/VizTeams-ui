import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../../../shared/models/team.models';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private apiUrl = 'http://localhost:3000/api/members';

  constructor(private http: HttpClient) {}

  addMember(teamId: string, member: any): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, { teamId, member });
  }
}
