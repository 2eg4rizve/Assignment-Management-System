"use client";

import { createContext, useContext } from "react";

import type { CurrentUser } from "./auth.types";

const AuthContext = createContext<CurrentUser | null>(null);

export const AuthProvider = AuthContext.Provider;

export function useCurrentUser() {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("useCurrentUser must be used inside AuthProvider.");
  }

  return user;
}
