import { cookies } from "next/headers";

export async function CsrfInput() {
  // Note: cookie creation is handled in middleware / server actions.
  // Server Components cannot set cookies in production.
  const token = (await cookies()).get("csrf_token")?.value ?? "";
  return <input type="hidden" name="csrf" value={token} />;
}


