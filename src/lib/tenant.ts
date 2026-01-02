import { redirect, notFound } from "next/navigation";
import type { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasRole } from "@/lib/roles";

export async function requireUserId() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.userId;
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function requireStoreMembership(storeSlug: string, atLeast: StoreRole) {
  const userId = await requireUserId();

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    select: { id: true, name: true, slug: true },
  });
  if (!store) notFound();

  const membership = await prisma.storeMembership.findUnique({
    where: { storeId_userId: { storeId: store.id, userId } },
    select: { role: true },
  });
  if (!membership) notFound();

  if (!hasRole(atLeast, membership.role)) {
    throw new Error("Forbidden");
  }

  return { userId, storeId: store.id, storeSlug: store.slug, storeName: store.name, role: membership.role };
}


