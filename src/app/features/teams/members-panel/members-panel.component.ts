import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
@Component({
  selector: 'app-members-panel',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.css',
})
export class MembersPanelComponent {
  @Input() team: Team | null = null;
  get hasTeam() {
    return !!this.team;
  }
}
