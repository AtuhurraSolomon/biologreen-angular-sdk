BioLogreen Angular SDK

The official Angular SDK for the Bio-Logreen Facial Authentication API.

This library provides a powerful, idiomatic way to integrate face-based signup and login into your Angular applications. It features a dedicated service for handling all the complex logic and a standalone component for a seamless camera view.

Features

BioLogreenService: A robust, injectable service that manages loading AI models, camera streams, face detection, and API communication.

<biologreen-camera-view>: A standalone component providing a ready-to-use live camera feed.

Fully Reactive: Built with RxJS, exposing reactive state (isLoading$, faceDetected$, error$) for building dynamic UIs with the async pipe.

TypeScript Support: Fully typed for a superior developer experience and compile-time safety.

Installation

npm install biologreen-sdk face-api.js


(Note: Replace biologreen-sdk with your final published package name, e.g., @biologreen/angular)

⚠️ Important: Setup & Configuration

This SDK requires face-api.js for face detection, which needs its AI model files to be available in your application.

1. Download AI Models

You must download the tiny_face_detector model weights from the face-api.js repository.

2. Host the Models in Your assets Folder

In your Angular project, create a new folder at src/assets/models.

Place the downloaded model files inside this new folder.

Open your angular.json file and ensure your assets array includes the src/assets directory. This makes the models available to your application.

// in angular.json
"projects": {
  "your-app-name": {
    "architect": {
      "build": {
        "options": {
          "assets": [
            "src/favicon.ico",
            "src/assets"
          ],
          // ...
        }
      }
    }
  }
}


Quick Start: Usage Example

Here is a complete example of how to use the service and component in your own standalone Angular component.

1. Import the SDK

In your component file (e.g., app.component.ts), import the BioLogreenService and CameraViewComponent.

// your-component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BioLogreenService, CameraViewComponent } from 'biologreen-sdk';
import { first } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonModule, CameraViewComponent], // Import the component
  templateUrl: './your-component.html',
  providers: [BioLogreenService], // Provide the service
})
export class YourComponent implements OnInit {
  // Expose the service's observables to your template
  public isLoading$: Observable<boolean>;
  public isInitializing$: Observable<boolean>;
  public faceDetected$: Observable<boolean>;
  public error$: Observable<string | null>;

  constructor(private biologreenService: BioLogreenService) {
    // Initialize the properties in the constructor
    this.isLoading$ = this.biologreenService.isLoading$;
    this.isInitializing$ = this.biologreenService.isInitializing$;
    this.faceDetected$ = this.biologreenService.faceDetected$;
    this.error$ = this.biologreenService.error$;
  }

  ngOnInit(): void {
    // 2. Configure the service
    this.biologreenService.configure({
      apiKey: 'YOUR_PROJECT_API_KEY',
      baseURL: 'http://localhost:8000/v1', // Optional: for local testing
      modelPath: '/assets/models'
    });
  }

  // 3. Create methods to call the service
  handleSignup(): void {
    this.biologreenService.signupWithFace()
      .pipe(first())
      .subscribe({
        next: (response) => alert(`Signup Success! User ID: ${response.user_id}`),
        error: (err) => alert(`Signup Failed: ${err.message}`),
      });
  }
}


2. Use in Your Template

In your component's HTML file (e.g., your-component.html), you can now use the component and bind to the reactive state with the async pipe.

<!-- your-component.html -->
<div>
  <h1>Bio-Logreen Authentication</h1>

  <div *ngIf="isInitializing$ | async">
    <p>Initializing Camera and AI Models...</p>
  </div>

  <div class="camera-container">
    <!-- Use the SDK's camera component -->
    <biologreen-camera-view></biologreen-camera-view>
  </div>

  <div *ngIf="!(isInitializing$ | async)">
    <p>Face Detected: {{ (faceDetected$ | async) ? 'Yes' : 'No' }}</p>
    <button (click)="handleSignup()" [disabled]="isLoading$ | async">
      Sign Up with Face
    </button>
  </div>

  <div *ngIf="error$ | async as errorMessage" style="color: red;">
    <p>Error: {{ errorMessage }}</p>
  </div>
</div>


API Reference: BioLogreenService

Public Observables

isLoading$: Observable<boolean>: Emits true while an API call is in progress.

isInitializing$: Observable<boolean>: Emits true while the camera and AI models are loading.

faceDetected$: Observable<boolean>: Emits true when a face is visible in the camera.

error$: Observable<string | null>: Emits an error message string if an operation fails.

Public Methods

configure(config: BioLogreenConfig): Initializes the service with your API key and settings.

signupWithFace(customFields?: object): Observable<FaceAuthResponse>: Initiates a signup attempt.

loginWithFace(): Observable<FaceAuthResponse>: Initiates a login attempt.
