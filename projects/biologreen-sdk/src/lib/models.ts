/**
 * Represents the successful JSON response from the BioLogreen API.
 */
export interface FaceAuthResponse {
    user_id: number;
    is_new_user: boolean;
    custom_fields?: Record<string, any>;
}

/**
 * The configuration object required by the BioLogreenService.
 */
export interface BioLogreenConfig {
    apiKey: string;
    baseURL?: string;
    modelPath?: string; 
}
