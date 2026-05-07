export interface JwtUserPayload {
  userId: string;
  role?: string;
  roles?: string[];
  isAdmin?: boolean;
  [key: string]: unknown;
}
