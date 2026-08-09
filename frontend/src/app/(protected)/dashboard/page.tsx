"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getDashboardPath } from "@/features/auth/auth-routing";
import { useCurrentUser } from "@/features/auth/auth-context";
import { LoadingState } from "@/shared/components/feedback/loading-state";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    router.replace(getDashboardPath(user.roles));
  }, [router, user.roles]);

  return <LoadingState rows={3} />;
}
