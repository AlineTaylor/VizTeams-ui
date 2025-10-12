import { Component, Input, OnChanges, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { EditTeamDialogComponent } from '../edit-team-dialog/edit-team-dialog.component';

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

  private dialog = inject(MatDialog);

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

  openEditTeamDialog() {
    if (!this.team?._id) return;
    const ref = this.dialog.open(EditTeamDialogComponent, {
      width: '520px',
      maxHeight: '90vh',
      data: {
        id: this.team._id,
        teamName: this.team.teamName,
        description: this.team.description,
      },
    });
    ref.afterClosed().subscribe((result) => {
      // TODO Hook up to backend
      if (result?.teamName || result?.description) {
        console.log('Edit team result', result);
      }
    });
  }
}
