import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { Team } from '../../../../shared/models/team.models';
import { MatDialog } from '@angular/material/dialog';
import { AddTeamDialogComponent } from '../add-team-dialog/add-team-dialog.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent {
  constructor(private dialog: MatDialog) {}

  // TODO Hard-coded single team for now, structure ready for CRUD service wiring
  teams: Team[] = [
    {
      id: 'cornerstone',
      name: 'Cornerstone',
      members: [
        { id: 'u1', name: 'Ryan Everett', role: 'Software Engineer', avatarUrl: 'https://picsum.photos/seed/ryan/80' },
        { id: 'u2', name: 'Graham Walker', role: 'Software Engineer' },
        { id: 'u3', name: 'Benjamin Martin', role: 'Software Engineer', avatarUrl: 'https://picsum.photos/seed/benmartin/80' },
        { id: 'u4', name: 'Brandon Clark', role: 'Software Engineer' },
        { id: 'u5', name: 'Sidhant Amatya', role: 'Quality Engineer', avatarUrl: 'https://picsum.photos/seed/sidhant/80' },
      ],
    },
  ];

  panelOpenState: Record<string, boolean> = {};

  toggle(teamId: string) {
    this.panelOpenState[teamId] = !this.panelOpenState[teamId];
  }

  @Output() selectTeam = new EventEmitter<Team>();

  onSelect(team: Team) {
    this.selectTeam.emit(team);
  }

openAddTeamDialog() {
  const dialogRef = this.dialog.open(AddTeamDialogComponent, {
    width: '700px',
    maxWidth: '90vw',
    panelClass: 'custom-add-team-dialog',
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result?.name) {
      this.teams.push({
        id: crypto.randomUUID(),
        name: result.name,
        members: [],
      });
    }
  });
  }
}