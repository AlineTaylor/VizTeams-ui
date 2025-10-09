import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { Team, TeamMember } from '../../../shared/models/team.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = `${environment.apiUrl}/teams`;
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTeams();
  }

  /** Helper to get authorization headers */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  /** Fetch teams from the backend */
  loadTeams() {
    this.http
      .get<Team[]>(this.apiUrl, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error('❌ Failed to load teams:', err);
          return of([]);
        })
      )
      .subscribe((teams) => {
        console.log('✅ Loaded teams from backend:', teams);
        this.teamsSubject.next(teams);
      });
  }

 addTeam(newTeam: Team) {
  this.http.post<Team>(this.apiUrl, newTeam).subscribe({
    next: (created) => {
      console.log('✅ Created team:', created);
      // Refresh list directly from backend
      this.loadTeams();
    },
    error: (err) => console.error('❌ Error adding team:', err),
  });
}


  /** Delete team */
  deleteTeam(id: string) {
    this.http
      .delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          const updated = this.teamsSubject.value.filter((t) => t._id !== id);
          this.teamsSubject.next(updated);
          console.log(`✅ Deleted team ${id}`);
        },
        error: (err) => console.error('❌ Error deleting team:', err),
      });
  }

  /** Adding a member to a team */
  addMemberToTeam(teamId: string, member: TeamMember) {
    const url = `${this.apiUrl}/${teamId}/members`;
    this.http.post<TeamMember>(url, member).subscribe({
      next: (saved) => {
        // Update local state only after success
        const current = this.teamsSubject.value;
        const idx = current.findIndex((t) => t._id === teamId);
        if (idx === -1) return;
        const updatedTeam: Team = {
          ...current[idx],
          members: [...current[idx].members, saved],
        };
        const updated = [...current];
        updated[idx] = updatedTeam;
        this.teamsSubject.next(updated);
      },
      error: (err) => console.error('Error adding member:', err),
    });
  }
}
