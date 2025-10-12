import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AddTeamDialogComponent } from '../add-team-dialog/add-team-dialog.component';
import { TeamService } from '../../../core/services/team.service';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [SharedModule, MatProgressBarModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  panelOpenState: Record<string, boolean> = {};
  selectedTeam: Team | null = null;
  readonly TEAM_CAPACITY = 12;
  readonly maxAvatars = 12;

  // Loading state for progress bar
  loading = signal<boolean>(false);

  @Output() selectTeam = new EventEmitter<Team>();

  constructor(private dialog: MatDialog, private teamService: TeamService) {}

  ngOnInit() {
  this.loadTeams();

  // 👇 Listen to BehaviorSubject updates for instant changes
  this.teamService.teams$.subscribe((teams) => {
    this.teams = teams;
  });
}

  /** ✅ Load teams and toggle loading bar */
  loadTeams() {
    this.loading.set(true);
    this.teamService.getTeams().pipe(delay(1500)).subscribe({
  next: (teams) => {
    this.teams = teams;
    this.loading.set(false);
  },
  error: (err) => {
    console.error('❌ Error loading teams:', err);
    this.loading.set(false);
  },
});
  }

  toggle(teamId: string) {
    this.panelOpenState[teamId] = !this.panelOpenState[teamId];
  }

  onSelect(team: Team) {
    this.selectTeam.emit(team);
    this.selectedTeam = team;
  }

  onClose(team: Team) {
    if (team._id) {
      this.panelOpenState[team._id] = false;
      if (this.selectedTeam?._id === team._id) {
        this.selectedTeam = null;
      }
    }
  }

  openAddTeamDialog() {
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      panelClass: 'custom-add-team-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.teamName && result?.description) {
        const newTeam: Team = {
          teamName: result.teamName,
          description: result.description,
          members: [],
        };
        this.teamService.addTeam(newTeam);
      }
    });
  }

  deleteSelectedTeam() {
    if (!this.selectedTeam?._id) return;
    const confirmDelete = confirm(
      `Are you sure you want to delete "${this.selectedTeam.teamName}"?`
    );
    if (confirmDelete) {
      this.teamService.deleteTeam(this.selectedTeam._id);
      this.selectedTeam = null;
    }
  }

  onAddMember(team: Team) {
    if (!team._id || this.isTeamFull(team)) return;

    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '520px',
      maxHeight: '90vh',
      data: {
        teamId: team._id,
        teams: this.teams.map((t) => ({ _id: t._id, teamName: t.teamName })),
      },
    });

    dialogRef.afterClosed().subscribe((updatedTeam) => {
      if (updatedTeam) {
        const index = this.teams.findIndex((t) => t._id === updatedTeam._id);
        if (index > -1) {
          this.teams[index] = updatedTeam;
        }

        if (this.selectedTeam?._id === updatedTeam._id) {
          this.selectedTeam = updatedTeam;
        }

        console.log('✅ Member added successfully — team updated:', updatedTeam);
      }
    });
  }

  isTeamFull(team: Team): boolean {
    return team.members.length >= this.TEAM_CAPACITY;
  }

  getDisplayedMembers(team: Team) {
    return team.members.slice(0, this.maxAvatars);
  }

  trackMember = (_: number, m: any) => m._id || m.name;
}
