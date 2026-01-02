"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ensureCsrfCookie, setSessionCookie } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { assertCsrfFromForm } from "@/lib/csrf";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  await assertCsrfFromForm(formData);

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) redirect("/login?error=1");

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, passwordHash: true },
  });

  if (!user) redirect("/login?error=1");
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) redirect("/login?error=1");

  await setSessionCookie(user.id);
  await ensureCsrfCookie();

  redirect(parsed.data.next || "/dashboard");
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function registerAction(formData: FormData) {
  await assertCsrfFromForm(formData);

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/register?error=1");

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) redirect("/register?error=exists");

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: { email, name: parsed.data.name, passwordHash },
    select: { id: true },
  });

  await setSessionCookie(user.id);
  await ensureCsrfCookie();

  redirect("/dashboard");
}


