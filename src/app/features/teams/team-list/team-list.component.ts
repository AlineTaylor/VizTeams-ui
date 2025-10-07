import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamDialogComponent } from '../add-team-dialog/add-team-dialog.component';
import { TeamService } from '../../../core/services/team.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];
  panelOpenState: Record<string, boolean> = {};
  selectedTeam: Team | null = null; // 👈 track currently selected team

  @Output() selectTeam = new EventEmitter<Team>();

  constructor(private dialog: MatDialog, private teamService: TeamService) {}

  ngOnInit() {
    this.teamService.teams$.subscribe((teams) => (this.teams = teams));
  }

  toggle(teamId: string) {
    this.panelOpenState[teamId] = !this.panelOpenState[teamId];
  }

  onSelect(team: Team) {
    this.selectTeam.emit(team);
    this.selectedTeam = team;
  }

  onClose(team: Team) {
  this.panelOpenState[team.id] = false;
  if (this.selectedTeam?.id === team.id) {
    this.selectedTeam = null;
  }
}


  openAddTeamDialog() {
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      panelClass: 'custom-add-team-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.name) {
        const newTeam: Team = {
          id: crypto.randomUUID(),
          name: result.name,
          members: [],
        };
        this.teamService.addTeam(newTeam);
      }
    });
  }

  deleteSelectedTeam() {
    if (!this.selectedTeam) return;
    const confirmDelete = confirm(
      `Are you sure you want to delete "${this.selectedTeam.name}"?`
    );
    if (confirmDelete) {
      this.teamService.deleteTeam(this.selectedTeam.id);
      this.selectedTeam = null;
    }
  }
}
