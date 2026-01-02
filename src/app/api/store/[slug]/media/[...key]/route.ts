import fs from "node:fs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resolveStoreFilePath } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; key: string[] }> }) {
  const { slug, key } = await ctx.params;
  const store = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
  if (!store) return NextResponse.json({ ok: false }, { status: 404 });

  const joined = key.join("/");
  const media = await prisma.mediaFile.findUnique({
    where: { storeId_key: { storeId: store.id, key: joined } },
    select: { mimeType: true },
  });
  if (!media) return NextResponse.json({ ok: false }, { status: 404 });

  const abs = resolveStoreFilePath(store.id, joined);
  if (!fs.existsSync(abs)) return NextResponse.json({ ok: false }, { status: 404 });

  const stream = fs.createReadStream(abs);
  // @ts-expect-error - NextResponse supports streaming bodies
  return new NextResponse(stream, {
    headers: {
      "content-type": media.mimeType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}


