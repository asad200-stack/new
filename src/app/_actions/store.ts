"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertCsrfFromForm } from "@/lib/csrf";
import { slugify } from "@/lib/tenant";
import { requireUserId } from "@/lib/tenant";

const schema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80).optional(),
});

export async function createStoreAction(formData: FormData) {
  await assertCsrfFromForm(formData);
  const userId = await requireUserId();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
  });
  if (!parsed.success) redirect("/dashboard/new-store?error=1");

  const desiredSlug = slugify(parsed.data.slug || parsed.data.name);
  if (!desiredSlug) redirect("/dashboard/new-store?error=slug");

  const existing = await prisma.store.findUnique({ where: { slug: desiredSlug }, select: { id: true } });
  if (existing) redirect("/dashboard/new-store?error=taken");

  const store = await prisma.store.create({
    data: {
      name: parsed.data.name,
      slug: desiredSlug,
      settings: { create: { enableArabic: false, defaultLocale: "EN" } },
      stats: { create: {} },
      memberships: {
        create: { userId, role: "OWNER" },
      },
    },
    select: { slug: true },
  });

  redirect(`/dashboard/${store.slug}`);
}


