"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  ALPHA_ACTIVITY_EVENTS,
  ALPHA_INACTIVITY_TIMEOUT_MS
} from "@/platform/auth/inactivity-policy";

type InactivitySignOutProps = {
  enabled: boolean;
  timeoutMs?: number;
};

export function InactivitySignOut({
  enabled,
  timeoutMs = ALPHA_INACTIVITY_TIMEOUT_MS
}: InactivitySignOutProps) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const clearExistingTimeout = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };

    const closeInactiveSession = () => {
      void signOut({ callbackUrl: "/?reason=inactive" });
    };

    const resetTimeout = () => {
      clearExistingTimeout();
      timeoutRef.current = window.setTimeout(closeInactiveSession, timeoutMs);
    };

    for (const eventName of ALPHA_ACTIVITY_EVENTS) {
      window.addEventListener(eventName, resetTimeout, { passive: true });
    }

    resetTimeout();

    return () => {
      clearExistingTimeout();
      for (const eventName of ALPHA_ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, resetTimeout);
      }
    };
  }, [enabled, timeoutMs]);

  return null;
}
