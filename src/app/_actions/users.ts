"use server";

import { z } from "zod";
import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertCsrfFromForm } from "@/lib/csrf";
import { requireStoreMembership } from "@/lib/tenant";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  storeSlug: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(StoreRole),
});

export async function addUserToStoreAction(formData: FormData) {
  await assertCsrfFromForm(formData);
  const parsed = schema.safeParse({
    storeSlug: formData.get("storeSlug"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return;

  const ctx = await requireStoreMembership(parsed.data.storeSlug, StoreRole.OWNER);

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });
  if (!user) return;

  await prisma.storeMembership.upsert({
    where: { storeId_userId: { storeId: ctx.storeId, userId: user.id } },
    update: { role: parsed.data.role },
    create: { storeId: ctx.storeId, userId: user.id, role: parsed.data.role },
  });

  await logActivity({
    storeId: ctx.storeId,
    actorUserId: ctx.userId,
    type: "USER_ADDED",
    entityType: "user",
    entityId: user.id,
    meta: { role: parsed.data.role },
  });
}


