import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-members-panel',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './members-panel.component.html',
  styleUrl: './members-panel.component.css',
})
export class MembersPanelComponent {
  // TODO placeholder! Set up expanded view later (next story)
  message = 'Select a team to view members.';
}
