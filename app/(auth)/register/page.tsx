import { Suspense } from "react";
import { resolveAuthPlatform } from "@/lib/auth-platform";
import { RegisterForm } from "./register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ platform?: string }>;
}) {
  const params = await searchParams;
  const initialPlatform = resolveAuthPlatform(params.platform);

  return (
    <Suspense fallback={null}>
      <RegisterForm initialPlatform={initialPlatform} />
    </Suspense>
  );
}
