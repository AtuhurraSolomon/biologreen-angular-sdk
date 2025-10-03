import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioLogreenService } from '../biologreen.service';

@Component({
  selector: 'biologreen-camera-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './/camera-view.component.html',
  styleUrls: ['.//camera-view.component.css']
})
export class CameraViewComponent implements OnInit {
  // Use @ViewChild to get a direct reference to the <video> element in the template.
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;

  // Inject our service to communicate with it.
  constructor(private biologreenService: BioLogreenService) {}

  // When the component is initialized, tell the service about the video element.
  ngOnInit(): void {
    this.biologreenService.registerVideoElement(this.videoElement.nativeElement);
  }
}