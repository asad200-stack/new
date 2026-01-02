import { NextResponse } from "next/server";
import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCsrfToken, getSession } from "@/lib/auth";
import { hasRole } from "@/lib/roles";
import { saveImageForStore } from "@/lib/storage";
import { logActivity } from "@/lib/activity";

export async function POST(req: Request, ctx: { params: Promise<{ storeSlug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const csrfCookie = await getCsrfToken();
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ ok: false, error: "CSRF" }, { status: 403 });
  }

  const { storeSlug } = await ctx.params;
  const store = await prisma.store.findUnique({ where: { slug: storeSlug }, select: { id: true } });
  if (!store) return NextResponse.json({ ok: false }, { status: 404 });

  const membership = await prisma.storeMembership.findUnique({
    where: { storeId_userId: { storeId: store.id, userId: session.userId } },
    select: { role: true },
  });
  if (!membership) return NextResponse.json({ ok: false }, { status: 404 });
  if (!hasRole(StoreRole.EDITOR, membership.role)) return NextResponse.json({ ok: false }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = (formData.get("folder") as string | null) || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file." }, { status: 400 });
  }

  try {
    const saved = await saveImageForStore({ storeId: store.id, folder, file });

    const media = await prisma.mediaFile.create({
      data: {
        storeId: store.id,
        key: saved.key,
        folder: saved.folder,
        filename: saved.filename,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        width: saved.width ?? undefined,
        height: saved.height ?? undefined,
        sha256: saved.sha256,
      },
      select: { id: true, key: true },
    });

    await logActivity({
      storeId: store.id,
      actorUserId: session.userId,
      type: "MEDIA_UPLOADED",
      entityType: "media",
      entityId: media.id,
    });

    return NextResponse.json({
      ok: true,
      mediaId: media.id,
      url: `/api/store/${encodeURIComponent(storeSlug)}/media/${media.key}`,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}


