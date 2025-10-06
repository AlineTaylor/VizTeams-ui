import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent {
  // TODO Hard-coded single team for now, structure ready for CRUD service wiring
  teams: Team[] = [
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

  panelOpenState: Record<string, boolean> = {};

  toggle(teamId: string) {
    this.panelOpenState[teamId] = !this.panelOpenState[teamId];
  }

  @Output() selectTeam = new EventEmitter<Team>();

  onSelect(team: Team) {
    this.selectTeam.emit(team);
  }
}
