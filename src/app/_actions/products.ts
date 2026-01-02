"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { assertCsrfFromForm } from "@/lib/csrf";
import { requireStoreMembership } from "@/lib/tenant";
import { logActivity } from "@/lib/activity";

const moneyCents = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/)
  .transform((v) => Math.round(parseFloat(v) * 100));

const baseSchema = z.object({
  storeSlug: z.string().min(1),
  name: z.string().min(2).max(120),
  description: z.string().max(5000).optional().nullable(),
  specs: z.string().max(5000).optional().nullable(),
  sku: z.string().max(80).optional().nullable(),
  currency: z.string().min(2).max(8),
  originalPrice: moneyCents,
  discountedPrice: moneyCents.optional().nullable(),
  discountEnabled: z.enum(["on"]).optional(),
  stockQty: z.coerce.number().int().min(0).max(1_000_000),
  isActive: z.enum(["on"]).optional(),
});

export async function createProductAction(formData: FormData) {
  await assertCsrfFromForm(formData);
  const parsed = baseSchema.safeParse({
    storeSlug: formData.get("storeSlug"),
    name: formData.get("name"),
    description: (formData.get("description") as string | null) || null,
    specs: (formData.get("specs") as string | null) || null,
    sku: (formData.get("sku") as string | null) || null,
    currency: formData.get("currency") || "USD",
    originalPrice: formData.get("originalPrice"),
    discountedPrice: formData.get("discountedPrice") || null,
    discountEnabled: formData.get("discountEnabled") ? "on" : undefined,
    stockQty: formData.get("stockQty"),
    isActive: formData.get("isActive") ? "on" : undefined,
  });
  if (!parsed.success) redirect("/dashboard?error=product");

  const ctx = await requireStoreMembership(parsed.data.storeSlug, StoreRole.EDITOR);

  const discountEnabled = Boolean(parsed.data.discountEnabled);
  const discountedPrice = discountEnabled ? parsed.data.discountedPrice ?? null : null;
  if (discountEnabled && discountedPrice != null && discountedPrice > parsed.data.originalPrice) {
    redirect(`/dashboard/${parsed.data.storeSlug}/products/new?error=discount`);
  }

  const product = await prisma.product.create({
    data: {
      storeId: ctx.storeId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      specs: parsed.data.specs ?? null,
      sku: parsed.data.sku ? String(parsed.data.sku) : null,
      currency: parsed.data.currency,
      originalPrice: parsed.data.originalPrice,
      discountedPrice,
      discountEnabled,
      stockQty: parsed.data.stockQty,
      isActive: Boolean(parsed.data.isActive),
    },
    select: { id: true },
  });

  await logActivity({
    storeId: ctx.storeId,
    actorUserId: ctx.userId,
    type: "PRODUCT_CREATED",
    entityType: "product",
    entityId: product.id,
  });

  redirect(`/dashboard/${ctx.storeSlug}/products/${product.id}/edit`);
}

export async function updateProductAction(formData: FormData) {
  await assertCsrfFromForm(formData);

  const productId = String(formData.get("productId") || "");
  if (!productId) redirect("/dashboard?error=product");

  const parsed = baseSchema.safeParse({
    storeSlug: formData.get("storeSlug"),
    name: formData.get("name"),
    description: (formData.get("description") as string | null) || null,
    specs: (formData.get("specs") as string | null) || null,
    sku: (formData.get("sku") as string | null) || null,
    currency: formData.get("currency") || "USD",
    originalPrice: formData.get("originalPrice"),
    discountedPrice: formData.get("discountedPrice") || null,
    discountEnabled: formData.get("discountEnabled") ? "on" : undefined,
    stockQty: formData.get("stockQty"),
    isActive: formData.get("isActive") ? "on" : undefined,
  });
  if (!parsed.success) redirect("/dashboard?error=product");

  const ctx = await requireStoreMembership(parsed.data.storeSlug, StoreRole.EDITOR);

  const existing = await prisma.product.findFirst({
    where: { id: productId, storeId: ctx.storeId },
    select: { id: true, originalPrice: true, isActive: true },
  });
  if (!existing) redirect(`/dashboard/${ctx.storeSlug}/products?error=notfound`);

  const discountEnabled = Boolean(parsed.data.discountEnabled);
  const discountedPrice = discountEnabled ? parsed.data.discountedPrice ?? null : null;
  if (discountEnabled && discountedPrice != null && discountedPrice > parsed.data.originalPrice) {
    redirect(`/dashboard/${ctx.storeSlug}/products/${productId}/edit?error=discount`);
  }

  const updated = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      specs: parsed.data.specs ?? null,
      sku: parsed.data.sku ? String(parsed.data.sku) : null,
      currency: parsed.data.currency,
      originalPrice: parsed.data.originalPrice,
      discountedPrice,
      discountEnabled,
      stockQty: parsed.data.stockQty,
      isActive: Boolean(parsed.data.isActive),
    },
    select: { id: true, originalPrice: true, isActive: true },
  });

  if (updated.originalPrice !== existing.originalPrice) {
    await logActivity({
      storeId: ctx.storeId,
      actorUserId: ctx.userId,
      type: "PRODUCT_PRICE_CHANGED",
      entityType: "product",
      entityId: updated.id,
    });
  } else if (updated.isActive !== existing.isActive) {
    await logActivity({
      storeId: ctx.storeId,
      actorUserId: ctx.userId,
      type: "PRODUCT_VISIBILITY_CHANGED",
      entityType: "product",
      entityId: updated.id,
    });
  } else {
    await logActivity({
      storeId: ctx.storeId,
      actorUserId: ctx.userId,
      type: "PRODUCT_UPDATED",
      entityType: "product",
      entityId: updated.id,
    });
  }

  redirect(`/dashboard/${ctx.storeSlug}/products`);
}


