import type {
  CompleteUploadResponse,
  FeedPage,
  InitUploadRequest,
  InitUploadResponse,
  LoginResponse,
  MetadataItem,
  RegisterResponse,
  StreamResolveResponse,
  UpdateMetadataDto,
  UploadStatusResponse,
} from '@/types/api';

export const getApiBase = (): string => {
  if (typeof window === 'undefined') {
    return (
      process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      'http://localhost:3000'
    );
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
};

export class ApiHttpError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let tokenGetter: () => string | null = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('stromen-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
};

let onUnauthorized: () => void = () => {};

export const configureAuth = (opts: {
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}) => {
  if (opts.getToken) tokenGetter = opts.getToken;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
};

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  token?: string;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, token, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const t = token ?? tokenGetter();
    if (t) finalHeaders['Authorization'] = `Bearer ${t}`;
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    cache: rest.cache ?? 'no-store',
  });

  if (res.status === 401 && auth && typeof window !== 'undefined') {
    onUnauthorized();
  }

  let payload: unknown = null;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    payload = await res.json().catch(() => null);
  } else {
    payload = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : null) ?? res.statusText;
    throw new ApiHttpError(res.status, message, payload);
  }

  return payload as T;
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<RegisterResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: { email, password },
        auth: false,
      }),
    login: (email: string, password: string) =>
      request<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      }),
  },
  uploads: {
    init: (payload: InitUploadRequest) =>
      request<InitUploadResponse>('/api/v1/uploads/init', {
        method: 'POST',
        body: payload,
      }),
    complete: (uploadId: string) =>
      request<CompleteUploadResponse>('/api/v1/uploads/complete', {
        method: 'POST',
        body: { uploadId },
      }),
    status: (uploadId: string) =>
      request<UploadStatusResponse>(`/api/v1/uploads/${uploadId}/status`),
  },
  metadata: {
    feed: (page = 1, limit = 24) =>
      request<FeedPage>(
        `/api/v1/metadata/feed?page=${page}&limit=${limit}`,
        { auth: false },
      ),
    getById: (id: string) =>
      request<MetadataItem>(`/api/v1/metadata/${id}`, { auth: false }),
    getByUpload: (uploadId: string) =>
      request<MetadataItem>(`/api/v1/metadata/by-upload/${uploadId}`, {
        auth: false,
      }),
    update: (id: string, dto: UpdateMetadataDto) =>
      request<MetadataItem>(`/api/v1/metadata/${id}`, {
        method: 'PATCH',
        body: dto,
      }),
    publish: (id: string, isPublished: boolean) =>
      request<MetadataItem>(`/api/v1/metadata/${id}/publish`, {
        method: 'PATCH',
        body: { isPublished },
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/v1/metadata/${id}`, {
        method: 'DELETE',
      }),
  },
  stream: {
    resolve: (uploadId: string) =>
      request<StreamResolveResponse>(`/api/v1/stream/${uploadId}`),
  },
};

export async function uploadToPresigned(
  url: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}
