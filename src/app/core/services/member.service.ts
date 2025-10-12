import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../../../shared/models/team.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private apiUrl = `${environment.apiUrl}/api/teams/add-member`;

  constructor(private http: HttpClient) {}

  addMember(teamId: string, member: any): Observable<Team> {
    const payload = {
      teamId,
      firstName: member.firstName,
      lastName: member.lastName,
      title: member.title,
      avatarUrl: member.avatarUrl,
    };

    return this.http.post<Team>(this.apiUrl, payload);
  }
}
