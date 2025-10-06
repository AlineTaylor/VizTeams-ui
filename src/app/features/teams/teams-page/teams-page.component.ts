import { Component } from '@angular/core';
import { TeamListComponent } from '../team-list/team-list.component';
import { MembersPanelComponent } from '../members-panel/members-panel.component';
import { Team } from '../../../../shared/models/team.models';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [TeamListComponent, MembersPanelComponent],
  templateUrl: './teams-page.component.html',
  styleUrl: './teams-page.component.css',
})
export class TeamsPageComponent {
  selectedTeam: Team | null = null;
  handleSelect(team: Team) {
    this.selectedTeam = team;
  }
}
