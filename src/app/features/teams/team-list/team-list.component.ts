import { Component, EventEmitter, Output, OnInit, signal } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamDialogComponent } from '../add-team-dialog/add-team-dialog.component';
import { TeamService } from '../../../core/services/team.service';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { delay } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [SharedModule, DragDropModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  panelOpenState: Record<string, boolean> = {};
  selectedTeam: Team | null = null;
  readonly TEAM_CAPACITY = 12;
  readonly maxAvatars = 12;
  // Track team capacity messages and timers
  capacityNotice: Record<string, boolean> = {};
  private capacityTimers: Record<string, ReturnType<typeof setTimeout>> = {};

  // Loading state for progress bar
  loading = signal<boolean>(false);

  // Sort state for team list
  teamSort: 'asc' | 'desc' = 'asc';

  @Output() selectTeam = new EventEmitter<Team | null>();

  constructor(
    private dialog: MatDialog,
    private teamService: TeamService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadTeams();

    // 👇 Listen to BehaviorSubject updates for instant changes
    this.teamService.teams$.subscribe((teams) => {
      this.teams = teams;
    });
  }

  /** Teams sorted by teamName per teamSort */
  getSortedTeams(): Team[] {
    return [...this.teams].sort((a, b) => {
      const cmp = (a.teamName || '').localeCompare(
        b.teamName || '',
        undefined,
        {
          sensitivity: 'base',
        }
      );
      return this.teamSort === 'asc' ? cmp : -cmp;
    });
  }

  /** ✅ Load teams and toggle loading bar */
  loadTeams() {
    this.loading.set(true);
    this.teamService
      .getTeams()
      .pipe(delay(1500))
      .subscribe({
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
        // Notify parent so members panel can go back to the default of showing all members again
        this.selectTeam.emit(null);
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
    if (!team._id) return;

    // If team is full, show a 3-sec red message per client's (John) request
    if (this.isTeamFull(team)) {
      this.showCapacityNotice(team._id);
      return;
    }

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
        this.snack.open('Member added', 'Close', { duration: 2500 });
        const index = this.teams.findIndex((t) => t._id === updatedTeam._id);
        if (index > -1) {
          this.teams[index] = updatedTeam;
        }

        if (this.selectedTeam?._id === updatedTeam._id) {
          this.selectedTeam = updatedTeam;
        }

        console.log(
          '✅ Member added successfully — team updated:',
          updatedTeam
        );
      }
    });
  }

  private showCapacityNotice(teamId: string) {
    this.capacityNotice[teamId] = true;
    // Reset existing timer (if any) for this team
    if (this.capacityTimers[teamId]) {
      clearTimeout(this.capacityTimers[teamId]);
    }
    this.capacityTimers[teamId] = setTimeout(() => {
      this.capacityNotice[teamId] = false;
      delete this.capacityTimers[teamId];
    }, 3000);
  }

  isTeamFull(team: Team): boolean {
    return team.members.length >= this.TEAM_CAPACITY;
  }

  getDisplayedMembers(team: Team) {
    return team.members.slice(0, this.maxAvatars);
  }

  trackMember = (_: number, m: any) => m._id || m.name;

  onDropMember(event: CdkDragDrop<any[]>, team: Team) {
    if (event.previousContainer === event.container) {
      moveItemInArray(team.members, event.previousIndex, event.currentIndex);
      console.log(`${team.teamName} reordered:`, team.members);

      if (team._id) {
        this.teamService.updateMemberOrder(team._id, team.members).subscribe({
          next: (updatedTeam) => {
            console.log('✅ Order saved to backend:', updatedTeam);
            this.snack.open('Member order updated', 'Close', {
              duration: 2000,
            });
          },
          error: (err) => {
            console.error('❌ Failed to save order:', err);
            this.snack.open('Failed to save order', 'Close', {
              duration: 2000,
            });
          },
        });
      }
    }
  }
}
