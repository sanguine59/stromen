export interface JwtUserPayload {
  userId: string;
  [key: string]: unknown;
}
