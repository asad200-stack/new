import { getCsrfToken } from "@/lib/auth";

export async function assertCsrfFromForm(formData: FormData) {
  const cookieToken = await getCsrfToken();
  const formToken = formData.get("csrf");
  if (!cookieToken || typeof formToken !== "string" || formToken !== cookieToken) {
    throw new Error("CSRF token mismatch.");
  }
}


