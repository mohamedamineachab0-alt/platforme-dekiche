import { Suspense } from "react";
import { resolveAuthPlatform } from "@/lib/auth-platform";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const params = await searchParams;
  const initialPlatform = resolveAuthPlatform(params.platform);

  return (
    <Suspense fallback={null}>
      <LoginForm initialPlatform={initialPlatform} />
    </Suspense>
  );
}
