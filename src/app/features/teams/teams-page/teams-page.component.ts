import { Component } from '@angular/core';
import { TeamListComponent } from '../team-list/team-list.component';
import { MembersPanelComponent } from '../members-panel/members-panel.component';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [TeamListComponent, MembersPanelComponent],
  templateUrl: './teams-page.component.html',
  styleUrl: './teams-page.component.css'
})
export class TeamsPageComponent {}
