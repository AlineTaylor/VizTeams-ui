import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { Team } from '../../../shared/models/team.models';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = 'http://localhost:3000/teams';
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTeams();
  }

  /** Fetch teams from the backend */
  loadTeams() {
    this.http
      .get<Team[]>(this.apiUrl)
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

  /** Add a new team */
  addTeam(newTeam: Team) {
    this.http.post<Team>(this.apiUrl, newTeam).subscribe({
      next: (created) => {
        const updated = [...this.teamsSubject.value, created];
        this.teamsSubject.next(updated);
      },
      error: (err) => console.error('❌ Error adding team:', err),
    });
  }

  /** Delete team */
  deleteTeam(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const updated = this.teamsSubject.value.filter((t) => t._id !== id);
        this.teamsSubject.next(updated);
      },
      error: (err) => console.error('❌ Error deleting team:', err),
    });
  }
}
