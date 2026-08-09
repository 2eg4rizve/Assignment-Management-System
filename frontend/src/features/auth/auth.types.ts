import type { UserRole } from "@/shared/api/contracts";

export type LoginRequest = {
  email: string;
  password: string;
};

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  roles: UserRole[];
};

export type AuthResponse = {
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  user: CurrentUser;
};

export type BrowserSessionResponse = {
  user: CurrentUser;
};
