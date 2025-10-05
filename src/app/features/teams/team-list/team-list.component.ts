import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent {
  // TODO placeholder for now, wire to service later
  teams: string[] = [];
}
