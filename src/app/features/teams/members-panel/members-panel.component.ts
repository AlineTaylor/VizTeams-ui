import { Component, Input, OnChanges, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { EditTeamDialogComponent } from '../edit-team-dialog/edit-team-dialog.component';
import { TeamService } from '../../../core/services/team.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { MemberService } from '../../../core/services/member.service';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-members-panel',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './members-panel.component.html',
  styleUrls: ['./members-panel.component.css'],
})
export class MembersPanelComponent implements OnChanges {
  @Input() team: Team | null = null;
  @Input() allTeams: Team[] = [];
  hasTeam = false;
  displayMembers: any[] = [];

  private dialog = inject(MatDialog);
  private teamService = inject(TeamService);
  private snack = inject(MatSnackBar);
  private memberService = inject(MemberService);

  ngOnChanges() {
    if (this.team) {
      this.hasTeam = true;
      this.displayMembers = this.team.members;
    } else {
      this.hasTeam = false;
      this.displayMembers = this.allTeams.flatMap((t) =>
        t.members.map((m) => ({
          ...m,
          teamName: t.teamName,
        }))
      );
    }
  }

  // ✏️ Edit Team Dialog
  openEditTeamDialog() {
    if (!this.team?._id) return;
    const id = this.team._id;

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
      this.team = { ...this.team, teamName, description } as any;

      this.teamService.updateTeam(id, { teamName, description }).subscribe({
        next: () =>
          this.snack.open('Team updated', 'Close', { duration: 2500 }),
        error: () =>
          this.snack.open('Failed to update team', 'Close', { duration: 3000 }),
      });
    });
  }

  // ✏️ Edit Member Dialog
  openEditMemberDialog(member: any) {
    if (!this.team?._id) return;

    const ref = this.dialog.open(AddMemberDialogComponent, {
      width: '520px',
      maxHeight: '90vh',
      data: {
        teamId: this.team._id,
        member,
        teams: [this.team],
      },
    });

    ref.afterClosed().subscribe((updatedMember) => {
      if (updatedMember?.__removed) {
        const removedId = updatedMember.memberId;
        if (this.team) {
          this.team.members = this.team.members.filter(
            (m) => m._id !== removedId
          );
          this.displayMembers = this.team.members;
        }
        this.snack.open('Member removed', 'Close', { duration: 2500 });
        return;
      }

      if (updatedMember) {
        const idx = this.team!.members.findIndex((m) => m._id === member._id);
        if (idx > -1) {
          this.team!.members[idx] = {
            ...this.team!.members[idx],
            ...updatedMember,
          };
        }
        this.snack.open('Member updated', 'Close', { duration: 2500 });
        console.log('✅ Member updated:', updatedMember);
      }
    });
  }

  // Remove member from current team
  confirmRemoveFromTeam(member: any) {
    if (!this.team?._id) return;
    const teamId = this.team._id;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Remove Member',
        message: `Remove ${member.name || 'this member'} from ${
          this.team.teamName
        }?`,
        confirmText: 'Remove',
        cancelText: 'Keep',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.memberService.removeMember(teamId, member._id).subscribe({
        next: () => {
          // Update local state
          this.team!.members = this.team!.members.filter(
            (m) => m._id !== member._id
          );
          this.displayMembers = this.team!.members;
          // Sync from backend
          this.teamService.loadTeams();
          this.snack.open('Member removed from team', 'Close', {
            duration: 2500,
          });
        },
        error: () =>
          this.snack.open('Failed to remove member', 'Close', {
            duration: 3000,
          }),
      });
    });
  }
}
