import { Component } from '@angular/core';
import { TeamListComponent } from '../team-list/team-list.component';
import { MembersPanelComponent } from '../members-panel/members-panel.component';
import { Team } from '../../../../shared/models/team.models';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [TeamListComponent, MembersPanelComponent],
  templateUrl: './teams-page.component.html',
  styleUrls: ['./teams-page.component.css'],
})
export class TeamsPageComponent {
  selectedTeam: Team | null = null;

  handleSelect(team: Team | null) {
    // Toggle: if same team clicked again, deselect it
    if (this.selectedTeam?._id === team?._id) {
      this.selectedTeam = null;
    } else {
      this.selectedTeam = team;
    }
  }
}
