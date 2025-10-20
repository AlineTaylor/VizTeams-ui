import { Component, Input, OnChanges, inject } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team, TeamMember } from '../../../../shared/models/team.models';
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
  displayMembers: Array<TeamMember & { teamName?: string }> = [];

  // State for sorting/filtering
  sortKey: 'first' | 'last' = 'first';
  sortDir: 'asc' | 'desc' = 'asc';
  roleFilter: string = 'all';
  roleOptions: string[] = [];

  // Total member counter (used for default 'All Members' view)
  get totalMembers(): number {
    if (this.hasTeam) return this.team?.members?.length || 0;
    if (!this.allTeams?.length) return 0;
    return this.allTeams.reduce(
      (sum, t) => sum + (Array.isArray(t.members) ? t.members.length : 0),
      0
    );
  }

  private dialog = inject(MatDialog);
  private teamService = inject(TeamService);
  private snack = inject(MatSnackBar);
  private memberService = inject(MemberService);

  ngOnChanges() {
    this.rebuildAndApply();
  }

  private rebuildAndApply() {
    // Create base list
    let list: Array<TeamMember & { teamName?: string }> = [];
    if (this.team) {
      this.hasTeam = true;
      list = [...(this.team.members || [])];
    } else {
      this.hasTeam = false;
      list = this.allTeams.flatMap((t) =>
        (t.members || []).map((m) => ({ ...m, teamName: t.teamName }))
      );
    }

    // Role options from current list
    const roles = Array.from(
      new Set(list.map((m) => (m.title || '').trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    this.roleOptions = roles;

    // Check current filter and reset if invalid
    if (this.roleFilter !== 'all' && !roles.includes(this.roleFilter)) {
      this.roleFilter = 'all';
    }
    // Apply filter + sort
    this.displayMembers = this.applySortAndFilter(list);
  }

  onRoleFilterChange(role: string) {
    this.roleFilter = role;
    this.displayMembers = this.applySortAndFilter(this.displayMembers, true);
  }

  onSortKeyChange(key: 'first' | 'last') {
    this.sortKey = key;
    this.displayMembers = this.applySortAndFilter(this.displayMembers, true);
  }

  onSortDirChange(dir: 'asc' | 'desc') {
    this.sortDir = dir;
    this.displayMembers = this.applySortAndFilter(this.displayMembers, true);
  }

  private applySortAndFilter(
    base: Array<TeamMember & { teamName?: string }>,
    baseIsAlreadyAltered = false
  ) {
    // If base is current display list (already filtered), rebuild from source first to avoid "double-filtering"
    let list = baseIsAlreadyAltered ? this.getBaseList() : base.slice(); //shallow copy

    // Filter by role
    if (this.roleFilter !== 'all') {
      list = list.filter((m) => (m.title || '').trim() === this.roleFilter);
    }

    // SORT \o/
    const dir = this.sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const aKey =
        this.sortKey === 'first'
          ? this.firstNameOf(a.name)
          : this.lastNameOf(a.name);
      const bKey =
        this.sortKey === 'first'
          ? this.firstNameOf(b.name)
          : this.lastNameOf(b.name);
      const cmp = aKey.localeCompare(bKey, undefined, { sensitivity: 'base' });
      return dir * cmp;
    });

    return list;
  }

  private getBaseList(): Array<TeamMember & { teamName?: string }> {
    if (this.hasTeam && this.team) {
      return [...(this.team.members || [])];
    }
    return this.allTeams.flatMap((t) =>
      (t.members || []).map((m) => ({ ...m, teamName: t.teamName }))
    );
  }

  private firstNameOf(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return (parts[0] || '').toLowerCase();
  }

  private lastNameOf(name: string | undefined): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return (
      parts.length > 1 ? parts[parts.length - 1] : parts[0] || ''
    ).toLowerCase();
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
        // Re-apply sorting/filter after update
        this.rebuildAndApply();
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
          this.rebuildAndApply();
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
