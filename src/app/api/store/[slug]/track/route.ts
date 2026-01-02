import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
  if (!store) return NextResponse.json({ ok: false }, { status: 404 });

  await prisma.storeStat.upsert({
    where: { storeId: store.id },
    update: { visitCount: { increment: 1 } },
    create: { storeId: store.id, visitCount: 1 },
  });

  return NextResponse.json({ ok: true });
}


