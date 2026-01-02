import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string; productId: string }> }) {
  const { slug, productId } = await ctx.params;
  const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
  if (!store) return NextResponse.json({ ok: false }, { status: 404 });

  const product = await prisma.product.findFirst({ where: { id: productId, storeId: store.id }, select: { id: true } });
  if (!product) return NextResponse.json({ ok: false }, { status: 404 });

  await prisma.$transaction([
    prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } }),
    prisma.storeStat.upsert({
      where: { storeId: store.id },
      update: { productViewCount: { increment: 1 } },
      create: { storeId: store.id, productViewCount: 1 },
    }),
  ]);

  return NextResponse.json({ ok: true });
}


