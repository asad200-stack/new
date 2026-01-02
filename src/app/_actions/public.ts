"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

const schema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().min(2).max(2000),
});

export async function sendStoreMessageAction(formData: FormData) {
  const parsed = schema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: (formData.get("phone") as string | null) || null,
    message: formData.get("message"),
  });
  if (!parsed.success) {
    redirect(`/store/${String(formData.get("slug") || "")}?sent=0`);
  }

  const store = await prisma.store.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true, slug: true },
  });
  if (!store) redirect("/");

  const customer = await prisma.customer.upsert({
    where: { storeId_email: { storeId: store.id, email: parsed.data.email.toLowerCase() } },
    update: { name: parsed.data.name, phone: parsed.data.phone || null },
    create: { storeId: store.id, name: parsed.data.name, email: parsed.data.email.toLowerCase(), phone: parsed.data.phone || null },
    select: { id: true },
  });

  const msg = await prisma.message.create({
    data: { storeId: store.id, customerId: customer.id, content: parsed.data.message },
    select: { id: true },
  });

  await prisma.storeStat.upsert({
    where: { storeId: store.id },
    update: { messageCount: { increment: 1 } },
    create: { storeId: store.id, messageCount: 1 },
  });

  await logActivity({
    storeId: store.id,
    actorUserId: null,
    type: "MESSAGE_RECEIVED",
    entityType: "message",
    entityId: msg.id,
  });

  redirect(`/store/${store.slug}?sent=1`);
}


