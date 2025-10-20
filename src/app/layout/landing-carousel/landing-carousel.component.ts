import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-carousel.component.html',
  styleUrls: ['./landing-carousel.component.css'],
})
export class LandingCarouselComponent {
  images = [
  '/carousel_image_1_1080p.png',
  '/carousel_image_2_1080p.png',
  '/carousel_image_3_1080p.png',
  '/carousel_image_4_1080p.png'
];

  currentIndex = 0;

  constructor() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 3000);
  }
}
