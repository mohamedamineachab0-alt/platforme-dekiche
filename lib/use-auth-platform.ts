"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  type AuthPlatform,
  rememberAuthPlatform,
  resolveAuthPlatform,
} from "@/lib/auth-platform";

/**
 * Resolves study vs languages from the URL only.
 * Server `initialPlatform` (from ?platform=) is the fallback when the query is absent.
 * Never overrides study /login with a remembered languages visit.
 */
export function useAuthPlatform(initialPlatform: AuthPlatform = "study"): AuthPlatform {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("platform");
  const platform: AuthPlatform = fromUrl
    ? resolveAuthPlatform(fromUrl)
    : initialPlatform;

  useEffect(() => {
    rememberAuthPlatform(platform);
  }, [platform]);

  return platform;
}
