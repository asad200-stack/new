"use server";

import { z } from "zod";
import { StoreLayoutStyle, StoreLocale, StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertCsrfFromForm } from "@/lib/csrf";
import { requireStoreMembership } from "@/lib/tenant";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  storeSlug: z.string().min(1),
  primaryColor: z.string().max(32).optional().nullable(),
  fontFamily: z.string().max(80).optional().nullable(),
  layoutStyle: z.nativeEnum(StoreLayoutStyle),
  enableArabic: z.enum(["on"]).optional(),
  defaultLocale: z.nativeEnum(StoreLocale),
});

export async function updateStoreSettingsAction(formData: FormData) {
  await assertCsrfFromForm(formData);
  const parsed = schema.safeParse({
    storeSlug: formData.get("storeSlug"),
    primaryColor: (formData.get("primaryColor") as string | null) || null,
    fontFamily: (formData.get("fontFamily") as string | null) || null,
    layoutStyle: formData.get("layoutStyle"),
    enableArabic: formData.get("enableArabic") ? "on" : undefined,
    defaultLocale: formData.get("defaultLocale"),
  });
  if (!parsed.success) return;

  const ctx = await requireStoreMembership(parsed.data.storeSlug, StoreRole.OWNER);

  await prisma.storeSettings.upsert({
    where: { storeId: ctx.storeId },
    update: {
      primaryColor: parsed.data.primaryColor || null,
      fontFamily: parsed.data.fontFamily || null,
      layoutStyle: parsed.data.layoutStyle,
      enableArabic: Boolean(parsed.data.enableArabic),
      defaultLocale: parsed.data.defaultLocale,
    },
    create: {
      storeId: ctx.storeId,
      primaryColor: parsed.data.primaryColor || null,
      fontFamily: parsed.data.fontFamily || null,
      layoutStyle: parsed.data.layoutStyle,
      enableArabic: Boolean(parsed.data.enableArabic),
      defaultLocale: parsed.data.defaultLocale,
    },
  });

  await logActivity({
    storeId: ctx.storeId,
    actorUserId: ctx.userId,
    type: "STORE_SETTINGS_UPDATED",
    entityType: "store_settings",
    entityId: ctx.storeId,
  });
}


