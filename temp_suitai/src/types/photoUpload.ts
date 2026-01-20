export interface PhotoUploadState {
  photo: string | null;
  isCapturing: boolean;
  error: string | null;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  photoUrl?: string;
}
