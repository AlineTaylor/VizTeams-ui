import { Component, Input, OnChanges, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { EditTeamDialogComponent } from '../edit-team-dialog/edit-team-dialog.component';
import { TeamService } from '../../../core/services/team.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private teamService = inject(TeamService);
  private snack = inject(MatSnackBar);

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
    const id = this.team._id; // for later use in callback
    const ref = this.dialog.open(EditTeamDialogComponent, {
      width: '520px',
      maxHeight: '90vh',
      data: {
        id,
        teamName: this.team.teamName,
        description: this.team.description,
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result || !id) return;
      const { teamName, description } = result;

      // reflect changes in the panel immediately
      this.team = { ...this.team, teamName, description } as any;

      // Persist to backend and update global teams store
      this.teamService.updateTeam(id, { teamName, description }).subscribe({
        next: () =>
          this.snack.open('Team updated', 'Close', { duration: 2500 }),
        error: () =>
          this.snack.open('Failed to update team', 'Close', { duration: 3000 }),
      });
    });
  }
}
