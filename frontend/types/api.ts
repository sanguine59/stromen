export type Visibility = 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
export type ProcessingState = 'DRAFT' | 'READY' | 'FAILED';
export type UploadStatus = 'DRAFT' | 'PROCESSING' | 'READY' | 'FAILED' | string;

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
}

export interface InitUploadRequest {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface InitUploadResponse {
  uploadId: string;
  presignedUrl: string;
}

export interface CompleteUploadResponse {
  success: boolean;
  message: string;
}

export interface UploadStatusResponse {
  status: UploadStatus;
  streamUrl: string | null;
}

export interface MetadataItem {
  id: string;
  uploadId: string;
  ownerId: string | null;
  title: string;
  description: string;
  tags: string[];
  visibility: Visibility;
  processingState: ProcessingState;
  isPublished: boolean;
  thumbnailUrl: string | null;
  hlsStreamUrl: string | null;
  durationSeconds: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedPage {
  items: MetadataItem[];
  page: number;
  limit: number;
  total: number;
}

export interface UpdateMetadataDto {
  title?: string;
  description?: string;
  visibility?: Visibility;
}

export interface StreamResolveResponse {
  uploadId: string;
  hlsStreamUrl: string;
  visibility: Visibility;
  durationSeconds: number | null;
  thumbnailUrl: string | null;
}

export interface ApiError {
  status: number;
  message: string;
}
