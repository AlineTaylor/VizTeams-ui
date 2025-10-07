import { Component, Input, OnChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';

@Component({
  selector: 'app-members-panel',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.css',
})
export class MembersPanelComponent implements OnChanges {
  @Input() team: Team | null = null;
  @Input() allTeams: Team[] = []; // 👈 new input
  hasTeam = false;
  displayMembers: any[] = [];

  ngOnChanges() {
    if (this.team) {
      this.hasTeam = true;
      this.displayMembers = this.team.members;
    } else {
      this.hasTeam = false;
      // 👇 flatten all team members
      this.displayMembers = this.allTeams.flatMap((t) =>
        t.members.map((m) => ({
          ...m,
          teamName: t.teamName,
        }))
      );
    }
  }
}
