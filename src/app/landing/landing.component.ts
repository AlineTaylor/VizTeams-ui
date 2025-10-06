import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="landing-wrapper">
      <h1>Welcome</h1>
      <p>Please sign in to view teams.</p>
    </div>
  `,
  styles: [`
    .landing-wrapper { padding: 48px 32px; max-width: 480px; }
    h1 { margin: 0 0 8px; font-size: 1.75rem; }
    p { margin: 0 0 24px; opacity: .8; }
    
  `]
})
export class LandingComponent {}