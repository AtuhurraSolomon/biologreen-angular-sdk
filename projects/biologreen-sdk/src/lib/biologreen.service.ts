import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import * as faceapi from 'face-api.js';
import { BioLogreenConfig, FaceAuthResponse } from './models';

// Internal type for our promise-like capture mechanism
type CaptureCompleter = {
    subject: Subject<FaceAuthResponse>;
    mode: 'login' | 'signup';
    customFields?: Record<string, any>;
};

@Injectable({
    providedIn: 'root'
})
export class BioLogreenService implements OnDestroy {
    // --- Private State Management with RxJS BehaviorSubjects ---
    private _isLoading = new BehaviorSubject<boolean>(false);
    private _isInitializing = new BehaviorSubject<boolean>(true);
    private _faceDetected = new BehaviorSubject<boolean>(false);
    private _error = new BehaviorSubject<string | null>(null);

    // --- Public Observables for developers to subscribe to ---
    public readonly isLoading$: Observable<boolean> = this._isLoading.asObservable();
    public readonly isInitializing$: Observable<boolean> = this._isInitializing.asObservable();
    public readonly faceDetected$: Observable<boolean> = this._faceDetected.asObservable();
    public readonly error$: Observable<string | null> = this._error.asObservable();

    // --- Internal Properties ---
    private config: BioLogreenConfig | null = null;
    private videoElement: HTMLVideoElement | null = null;
    private stream: MediaStream | null = null;
    private detectionInterval: any = null;
    private captureCompleter: CaptureCompleter | null = null;
    private modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

    constructor() {}

    /**
     * Configures the service with the necessary API key and optional settings.
     * This must be called before using the service.
     */
    public configure(config: BioLogreenConfig): void {
        this.config = config;
        if (config.modelPath) {
            this.modelPath = config.modelPath;
        }
    }

    /**
     * Registers the HTMLVideoElement from the CameraViewComponent.
     * This triggers the initialization of the camera and face detection models.
     * @internal This is called by the CameraViewComponent.
     */
    public registerVideoElement(element: HTMLVideoElement): void {
        this.videoElement = element;
        this._start();
    }

    /**
     * Initiates the automatic face login process.
     * @returns An Observable that emits the FaceAuthResponse on success or an error on failure.
     */
    public loginWithFace(): Observable<FaceAuthResponse> {
        const subject = new Subject<FaceAuthResponse>();
        this.captureCompleter = { subject, mode: 'login' };
        return subject.asObservable();
    }

    /**
     * Initiates the automatic face signup process.
     * @param customFields Optional custom data to store with the user.
     * @returns An Observable that emits the FaceAuthResponse on success or an error on failure.
     */
    public signupWithFace(customFields?: Record<string, any>): Observable<FaceAuthResponse> {
        const subject = new Subject<FaceAuthResponse>();
        this.captureCompleter = { subject, mode: 'signup', customFields };
        return subject.asObservable();
    }

    private async _start(): Promise<void> {
        if (!this.videoElement || !this.config) {
            this._error.next("Service not configured or video element not available.");
            return;
        }
        this._isInitializing.next(true);
        this._error.next(null);
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(this.modelPath);
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.videoElement.srcObject = this.stream;
            this.detectionInterval = setInterval(() => this._runDetection(), 200);
        } catch (e: any) {
            this._error.next(`Failed to start camera: ${e.message}`);
        } finally {
            this._isInitializing.next(false);
        }
    }

    private async _runDetection(): Promise<void> {
        if (!this.videoElement) return;

        const detections = await faceapi.detectAllFaces(this.videoElement, new faceapi.TinyFaceDetectorOptions());
        const faceIsPresent = detections.length > 0;
        
        if (this._faceDetected.value !== faceIsPresent) {
            this._faceDetected.next(faceIsPresent);
        }
        
        if (this.captureCompleter && faceIsPresent && !this._isLoading.value) {
            this._capturePhoto();
        }
    }

    private async _capturePhoto(): Promise<void> {
        if (!this.videoElement || !this.captureCompleter || !this.config) return;

        this._isLoading.next(true);
        const completer = this.captureCompleter;
        this.captureCompleter = null; // Prevent multiple captures

        try {
            const canvas = document.createElement('canvas');
            canvas.width = this.videoElement.videoWidth;
            canvas.height = this.videoElement.videoHeight;
            canvas.getContext('2d')?.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
            const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
            
            if (!imageBase64) throw new Error("Failed to capture image from video stream.");

            const endpoint = completer.mode === 'login' ? '/auth/login-face' : '/auth/signup-face';
            const baseURL = this.config.baseURL ?? 'https://api.biologreen.com/v1';
            
            const payload: any = { image_base64: imageBase64 };
            if (completer.mode === 'signup' && completer.customFields) {
                payload.custom_fields = completer.customFields;
            }

            const response = await fetch(`${baseURL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-KEY': this.config.apiKey },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.detail || 'An unknown API error occurred.');
            
            completer.subject.next(responseData as FaceAuthResponse);
            completer.subject.complete();

        } catch (e: any) {
            this._error.next(e.message);
            completer.subject.error(e);
        } finally {
            this._isLoading.next(false);
        }
    }
    
    /**
     * Cleans up resources when the service is destroyed.
     */
    ngOnDestroy(): void {
        clearInterval(this.detectionInterval);
        this.stream?.getTracks().forEach(track => track.stop());
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }
}