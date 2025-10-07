import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Team } from '../../../shared/models/team.models';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor() {
    const fallback = this.getFallbackTeams();
    this.teamsSubject.next(fallback);
  }

  /** Fetch all teams (later will pull from API) */
  getTeams(): Observable<Team[]> {
    return of(this.teamsSubject.value);
  }

  /** Add a team and update everyone subscribed */
  addTeam(newTeam: Team): void {
    const current = this.teamsSubject.value;
    const updated = [...current, newTeam];
    this.teamsSubject.next(updated);
  }

  /** Optional: Delete a team by id */
  deleteTeam(id: string): void {
    const updated = this.teamsSubject.value.filter((t) => t.id !== id);
    this.teamsSubject.next(updated);
  }

  /** Temporary hardcoded team */
  private getFallbackTeams(): Team[] {
    return [
      {
        id: 'cornerstone',
        name: 'Cornerstone',
        members: [
          { id: 'u1', name: 'Ryan Everett', role: 'Software Engineer', avatarUrl: 'https://picsum.photos/seed/ryan/80' },
          { id: 'u2', name: 'Graham Walker', role: 'Software Engineer' },
          { id: 'u3', name: 'Benjamin Martin', role: 'Software Engineer', avatarUrl: 'https://picsum.photos/seed/benmartin/80' },
          { id: 'u4', name: 'Brandon Clark', role: 'Software Engineer' },
          { id: 'u5', name: 'Sidhant Amatya', role: 'Quality Engineer', avatarUrl: 'https://picsum.photos/seed/sidhant/80' },
        ],
      },
    ];
  }
}
