import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Team } from '../../../shared/models/team.models';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly STORAGE_KEY = 'vizteams_teams';
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor() {
    // ✅ Try to load saved teams from localStorage
    const saved = localStorage.getItem(this.STORAGE_KEY);

    if (saved) {
      console.log('📦 Loaded teams from localStorage');
      this.teamsSubject.next(JSON.parse(saved));
    } else {
      console.log('⚙️ No saved data, using fallback');
      const fallback = this.getFallbackTeams();
      this.teamsSubject.next(fallback);
      this.saveToLocalStorage(fallback);
    }
  }

  /** Returns all teams as observable */
  getTeams(): Observable<Team[]> {
    return of(this.teamsSubject.value);
  }

  /** Add a new team */
  addTeam(newTeam: Team): void {
    const updated = [...this.teamsSubject.value, newTeam];
    this.teamsSubject.next(updated);
    this.saveToLocalStorage(updated); // ✅ persist
  }

  /** Delete a team */
  deleteTeam(id: string): void {
    const updated = this.teamsSubject.value.filter((t) => t.id !== id);
    this.teamsSubject.next(updated);
    this.saveToLocalStorage(updated); // ✅ persist
  }

  /** Helper: save to localStorage */
  private saveToLocalStorage(teams: Team[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(teams));
  }

  /** Temporary hardcoded Cornerstone team */
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
