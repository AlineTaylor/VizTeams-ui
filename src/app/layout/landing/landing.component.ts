import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { LandingCarouselComponent } from "../landing-carousel/landing-carousel.component";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [SharedModule, LandingCarouselComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {}
