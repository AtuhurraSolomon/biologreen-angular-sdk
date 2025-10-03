BioGreen SDK for Angular
The BioGreen SDK provides a set of tools for integrating facial recognition and authentication into your Angular applications. It wraps the powerful face-api.js library into an easy-to-use Angular service and provides a pre-built camera view component for a seamless user experience.

Features
BiologreenService: A service to handle the heavy lifting of loading facial recognition models, processing video streams, and performing facial authentication.

<biologreen-camera-view>: A standalone component that provides a live camera feed, ready to be integrated into your signup and login flows.

Easy Integration: Designed to be straightforward to drop into existing Angular applications.

Installation
To use the BioGreen SDK in your project, install it via npm:

npm install biologreen-sdk

You will also need to have @angular/common and rxjs as peer dependencies.

Usage
1. Importing the Service and Component
First, you need to import the necessary modules into the component where you want to use the SDK. Since the SDK components are standalone, you can import them directly.

// your-component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import from the SDK
import { BiologreenService } from 'biologreen-sdk';
import { CameraViewComponent } from 'biologreen-sdk'; // Assuming this is the component's class name

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [
    CommonModule,
    CameraViewComponent // Import the camera component here
  ],
  templateUrl: './your-component.html',
  providers: [BiologreenService] // Provide the service
})
export class YourComponent {
  constructor(private biologreenService: BiologreenService) {}

  // Your component logic
}

2. Using the Camera View Component
Place the component's selector in your HTML template to display the live camera feed.

<!-- your-component.html -->
<h1>User Authentication</h1>
<p>Please look into the camera to sign up or log in.</p>

<biologreen-camera-view></biologreen-camera-view>

<div class="actions">
    <button (click)="handleSignup()">Sign Up</button>
    <button (click)="handleLogin()">Log In</button>
</div>

3. Interacting with the BiologreenService
The service is the core of the library. You can use it to initiate authentication flows. The CameraViewComponent automatically registers itself with the service, so you just need to call the methods.

// your-component.ts

// ... (imports and component decorator)
export class YourComponent {
  constructor(private biologreenService: BiologreenService) {
    // It's good practice to load the models as soon as the component initializes.
    this.biologreenService.loadModels();
  }

  async handleSignup() {
    try {
      // Custom fields can be used to store additional user data.
      const customFields = { username: 'new-user-id' };
      const response = await this.biologreenService.capture('signup', customFields);

      console.log('Signup Successful!', response);
      // Handle successful signup, e.g., navigate to a welcome page.

    } catch (error) {
      console.error('Signup Failed:', error);
      // Handle errors, e.g., show a notification to the user.
    }
  }

  async handleLogin() {
    try {
      const response = await this.biologreenService.capture('login');

      console.log('Login Successful!', response);
      // Handle successful login, e.g., store user token and redirect.

    } catch (error) {
      console.error('Login Failed:', error);
      // Handle errors, such as "face not recognized".
    }
  }
}
