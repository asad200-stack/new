import { ensureCsrfCookie } from "@/lib/auth";

export async function CsrfInput() {
  const token = await ensureCsrfCookie();
  return <input type="hidden" name="csrf" value={token} />;
}


